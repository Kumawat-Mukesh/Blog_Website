from django.db.models import Q  # Include Prefetch here
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .pagination import StandardPagination
from .serializers import *
import uuid
from django.core.cache import cache
from django.utils import timezone

CustomUser = get_user_model()


class RegisterView(APIView):
	"""
	Handles user registration.
	"""
	parser_classes = (MultiPartParser, FormParser)  # Allows handling of multipart/form-data

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
	"""
	Handles user login and JWT token generation.
	"""

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		if serializer.is_valid():
			return Response(serializer.validated_data, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
	"""
	Handles user profile details (retrieve and update).
	"""
	authentication_classes = [JWTAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, username=None):
		# If username is provided in the URL, fetch that user's profile
		if username:
			try:
				user = User.objects.get(username=username)
				serializer = UserProfileSerializer(user)
				return Response(serializer.data, status=status.HTTP_200_OK)
			except User.DoesNotExist:
				return Response(
					{"detail": "User not found."},
					status=status.HTTP_404_NOT_FOUND
				)
		
		# If no username is provided, return the authenticated user's profile
		serializer = UserProfileSerializer(request.user)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def put(self, request):
		# Update user details using partial data
		serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
	"""
	Fetch all registered users.
	"""

	def get(self, request):
		# Fetch all users
		users = CustomUser.objects.filter(is_user=True)

		# Serialize the data
		serializer = UserProfileSerializer(users, many=True)

		return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    Handle password reset request by validating the email.
    Generate a token and provide it for password reset.
    """

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            reset_token = str(uuid.uuid4())  # Generate a unique token
            cache.set(f"password_reset_token_{user.id}", reset_token, timeout=3600)  # Store token in cache with 1-hour expiry
            return Response(
                {
                    "detail": "Password reset request successful.",
                    "token": reset_token,  # Return token (in a real application, securely deliver this)
                    "user_id": user.id,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    """
    Handle password reset using a token and updating to a new password.
    """

    def post(self, request, *args, **kwargs):
        uid = kwargs.get("uid")
        token = kwargs.get("token")
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({"detail": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate token
        cached_token = cache.get(f"password_reset_token_{user.id}")
        if cached_token != token:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PasswordResetSerializer(data=request.data, context={"user": user})
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"password_reset_token_{user.id}")  # Clear token after successful reset
            return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------------------------------------------------------------


class PostViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for managing posts with enhanced functionality:
	- Filtering by username, author, category, tags, and publication status.
	- Liking, commenting, and view incrementing.
	"""
	queryset = Post.objects.all()
	serializer_class = PostSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]  # Allows read-only access to unauthenticated users
	pagination_class = StandardPagination
	lookup_field = 'slug'  # Use slug instead of ID for unique identification.

	def get_queryset(self):
		"""
		Apply filters based on query parameters.
		"""
		queryset = Post.objects.all()
		user = self.request.user
		params = self.request.query_params

		# Filter by optional query parameters
		username = params.get('username')
		if username:
			queryset = queryset.filter(author__username=username)

		author_id = params.get('author')
		if author_id:
			try:
				author_id = int(author_id)
				queryset = queryset.filter(author_id=author_id)
			except ValueError:
				raise ValidationError("The 'author' query parameter must be a valid integer.")
		query = params.get('q')
		if query:
			queryset = queryset.filter(title__icontains=query)

		category_slug = params.get('category')
		if category_slug:
			try:
				category = Category.objects.get(slug=category_slug)
				queryset = queryset.filter(category=category)
			except ObjectDoesNotExist:
				raise ValidationError(f"Category with slug '{category_slug}' does not exist.")

		is_published = params.get('is_published')
		if is_published is not None:
			is_published = is_published.lower() in ['true', '1', 't', 'y', 'yes']
			queryset = queryset.filter(is_published=is_published)

		# If authenticated, allow viewing user-specific posts
		if user.is_authenticated:
			queryset = queryset.filter(Q(author=user) | Q(is_published=True)).distinct()

		return queryset

	@action(detail=False, methods=['get'], url_path='recent')
	def recent_posts(self, request):
		limit = int(request.query_params.get('limit', 5))  # Default limit is 5
		recent_posts = Post.objects.order_by('-created_at')[:limit]  # Fetch recent posts
		serializer = PostSerializer(recent_posts, many=True)
		return Response(serializer.data)

	def perform_create(self, serializer):
		"""
		Automatically set the author of the post as the logged-in user.
		"""
		serializer.save(author=self.request.user)

	@action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
	def like(self, request, slug=None):
		"""
		Like or unlike a post.
		"""
		post = get_object_or_404(Post, slug=slug)
		user = request.user

		# Check if the user has already liked the post
		like, created = PostLike.objects.get_or_create(user=user, post=post)

		if not created:  # User already liked the post, so "unlike"
			like.delete()  # Remove like
			post.decrement_likes()  # Decrement the likes count
			is_liked = False
		else:  # User has not liked the post, so "like"
			post.increment_likes()  # Increment the likes count
			is_liked = True

		# Ensure PostAnalytics is linked and updated
		post_analytics, created = PostAnalytics.objects.get_or_create(post=post)  # Get or create PostAnalytics

		# Update the likes count based on the PostLike relationship
		post_analytics.likes = post.likes.count()  # This assumes you have a related manager for likes in the Post model
		post_analytics.save()

		# Return the updated likes count and like status
		return Response({
			"detail": "You liked this post." if is_liked else "You unliked this post.",
			"is_liked": is_liked,
			"likes_count": post_analytics.likes,  # Send the updated likes count
		}, status=status.HTTP_200_OK)

	# Comment submission view
	@action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
	def comment(self, request, slug=None):
		post = get_object_or_404(Post, slug=slug)
		serializer = CommentSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save(post=post, author=request.user)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	@action(detail=True, methods=['get'])
	def comments_list(self, request, slug=None):	
		"""
		Retrieve all comments made on the specified post.
		"""
		post = get_object_or_404(Post, slug=slug)
		comments = Comment.objects.filter(post=post)
		serializer = CommentSerializer(comments, many=True)
		return Response(serializer.data, status=200)

	@action(detail=True, methods=["post"], permission_classes=[IsAuthenticatedOrReadOnly])
	def increment_views(self, request, slug=None):
		"""
		Increment the view count of a post only for unique visitors.
		Authenticated users are tracked via the `viewed_users` field,
		and anonymous users are tracked using session data.
		"""
		post = get_object_or_404(Post, slug=slug)

		# Ensure PostAnalytics exists
		analytics, _ = PostAnalytics.objects.get_or_create(post=post)

		if request.user.is_authenticated:
			# Check if the user has already viewed the post
			if not analytics.viewed_users.filter(id=request.user.id).exists():
				analytics.viewed_users.add(request.user)
				analytics.views += 1
				analytics.save()
		else:
			# Handle anonymous users using session
			session_key = f"viewed_post_{post.slug}"
			if not request.session.get(session_key, False):
				request.session[session_key] = True  # Mark as viewed
				analytics.views += 1
				analytics.save()

		return Response(
			{"status": "View incremented", "views_count": analytics.views},
			status=status.HTTP_200_OK
		)


	def list(self, request, *args, **kwargs):
		"""
		List all posts with optional filtering.
		This method is automatically handled by ModelViewSet.
		"""
		return super().list(request, *args, **kwargs)

	def retrieve(self, request, *args, **kwargs):
		"""
		Retrieve a specific post by its slug.
		This method is automatically handled by ModelViewSet.
		"""
		return super().retrieve(request, *args, **kwargs)

	def update(self, request, *args, **kwargs):
		"""
		Update an existing post (PUT request).
		Ensures the logged-in user can only update their own posts.
		"""
		post = self.get_object()  # Will check if the user is the owner

		if post.author != request.user:
			raise PermissionDenied("You are not allowed to edit this post.")

		serializer = self.get_serializer(post, data=request.data, partial=False)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		return Response(serializer.data)

	def partial_update(self, request, *args, **kwargs):
		"""
		Partially update an existing post (PATCH request).
		Ensures the logged-in user can only update their own posts.
		"""
		post = self.get_object()  # Will check if the user is the owner
		serializer = self.get_serializer(post, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)
		return Response(serializer.data)

	def destroy(self, request, *args, **kwargs):
		"""
		Delete an existing post.
		Ensures the logged-in user can only delete their own posts.
		"""
		post = self.get_object()  # Will check if the user is the owner
		post.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

	def get_object(self):
		slug = self.kwargs['slug']
		return get_object_or_404(Post, slug=slug)


# Profile View (CRUD for the authenticated user's profile)
class ProfileView(APIView):
	def get(self, request, *args, **kwargs):
		"""
		Get the profile of the logged-in user.
		"""
		profile = Profile.objects.get(user=request.user)
		serializer = UserProfileSerializer(profile)
		return Response(serializer.data)

	def put(self, request, *args, **kwargs):
		"""
		Update the profile of the logged-in user.
		"""
		profile = Profile.objects.get(user=request.user)
		serializer = UserProfileSerializer(profile, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def delete(self, request, *args, **kwargs):
		"""
		Delete the profile of the logged-in user.
		"""
		profile = Profile.objects.get(user=request.user)
		profile.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class FollowViewSet(viewsets.ViewSet):
	permission_classes = [IsAuthenticated]

	@action(detail=True, methods=['get'])
	def check_follow(self, request, id=None):
		"""
		Check if the logged-in user is following the target user.
		"""
		target_user = get_object_or_404(CustomUser, id=id)
		is_following = Follow.objects.filter(follower=request.user, followed=target_user).exists()

		return Response({"is_following": is_following}, status=status.HTTP_200_OK)

	@action(detail=True, methods=['get'])
	def followers(self, request, pk=None):
		"""
		Get the list of followers for a specific user.
		"""
		target_user = get_object_or_404(CustomUser, id=pk)
		followers = Follow.objects.filter(followed=target_user).select_related('follower')
		serialized_data = UserProfileSerializer([follow.follower for follow in followers], many=True).data

		return Response(serialized_data, status=status.HTTP_200_OK)

	@action(detail=True, methods=['get'])
	def following(self, request, pk=None):
		"""
		Get the list of users a specific user is following.
		"""
		target_user = get_object_or_404(CustomUser, id=pk)
		following = Follow.objects.filter(follower=target_user).select_related('followed')
		serialized_data = UserProfileSerializer([follow.followed for follow in following], many=True).data

		return Response(serialized_data, status=status.HTTP_200_OK)
	
	@action(detail=True, methods=['post'])
	def follow(self, request, pk=None):
		"""
		Follow or unfollow the target user.
		"""
		target_user = get_object_or_404(CustomUser, id=pk)

		# Prevent self-following
		if request.user == target_user:
			return Response(
				{"error": "You cannot follow yourself."}, 
				status=status.HTTP_400_BAD_REQUEST
			)

		# Check if already following
		follow_instance = Follow.objects.filter(follower=request.user, followed=target_user).first()

		if follow_instance:
			follow_instance.delete()
			return Response({"is_following": False}, status=status.HTTP_200_OK)
		else:
			Follow.objects.create(follower=request.user, followed=target_user)
			return Response({"is_following": True}, status=status.HTTP_201_CREATED)

class IsAuthorOrReadOnly(permissions.BasePermission):
	"""
	Custom permission to only allow authors of a comment to edit or delete it.
	"""

	def has_object_permission(self, request, view, obj):
		# Allow read-only access to everyone
		if request.method in permissions.SAFE_METHODS:
			return True

		# Allow the author to edit or delete their own comment
		return obj.author == request.user


class CommentViewSet(viewsets.ModelViewSet):
	queryset = Comment.objects.all()
	serializer_class = CommentSerializer
	permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
	pagination_class = StandardPagination

	def get_queryset(self):
		post_id = self.request.query_params.get('post_id', None)
		filter_param = self.request.query_params.get('filter', None)

		queryset = Comment.objects.all()

		# Apply filters
		if post_id:
			queryset = queryset.filter(post_id=post_id)

		if filter_param == 'mine':
			queryset = queryset.filter(author=self.request.user)

		return queryset

	def perform_create(self, serializer):
		serializer.save(author=self.request.user)

	def update(self, request, *args, **kwargs):
		comment = self.get_object()
		if comment.author != request.user:
			raise PermissionDenied("You do not have permission to edit this comment.")
		return super().update(request, *args, **kwargs)

	def destroy(self, request, *args, **kwargs):
		comment = self.get_object()
		if comment.author != request.user:
			raise PermissionDenied("You do not have permission to delete this comment.")
		return super().destroy(request, *args, **kwargs)


# Category ViewSet (CRUD for categories)

class CategoryViewSet(viewsets.ModelViewSet):
	queryset = Category.objects.all()
	serializer_class = CategorySerializer
	permission_classes = []  # No authentication required


# PostAnalytics ViewSet (View post analytics like views and likes)
class PostAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = PostAnalytics.objects.all()
	serializer_class = PostAnalyticsSerializer
	permission_classes = []  # No authentication required


# PostLike ViewSet (View and manage post likes)
class PostLikeViewSet(viewsets.ModelViewSet):
	queryset = PostLike.objects.all()
	serializer_class = PostLikeSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Restrict the queryset to the likes on posts created by the current user.
		"""
		return PostLike.objects.filter(post__author=self.request.user)


class IncrementViews(APIView):
	def post(self, request, slug):
		try:
			post = Post.objects.get(slug=slug)
			post.increment_views()
			return Response({"message": "Views incremented successfully."}, status=status.HTTP_200_OK)
		except Post.DoesNotExist:
			return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)


class UserFollowersCountView(APIView):
	"""
	View to get the number of followers of a user.
	"""

	def get(self, request, user_id, *args, **kwargs):
		try:
			user = CustomUser.objects.get(id=user_id)
		except CustomUser.DoesNotExist:
			return Response({"followers_count": "N/A"}, status=status.HTTP_404_NOT_FOUND)

		followers_count = Follow.objects.filter(followed=user).count()
		return Response({"followers_count": followers_count}, status=status.HTTP_200_OK)


class UserFollowingCountView(APIView):
	"""
	View to get the number of users that a user is following.
	"""

	def get(self, request, user_id, *args, **kwargs):
		try:
			user = CustomUser.objects.get(id=user_id)
		except CustomUser.DoesNotExist:
			return Response({"following_count": "N/A"}, status=status.HTTP_404_NOT_FOUND)

		following_count = Follow.objects.filter(follower=user).count()
		return Response({"following_count": following_count}, status=status.HTTP_200_OK)


class UserPostCountView(APIView):
	"""
	View to get the total number of posts of a user.
	"""

	def get(self, request, user_id, *args, **kwargs):
		try:
			user = CustomUser.objects.get(id=user_id)
		except CustomUser.DoesNotExist:
			return Response({"post_count": "N/A"}, status=status.HTTP_404_NOT_FOUND)

		# Assuming the correct field in the Post model is 'author'
		post_count = Post.objects.filter(author=user).count()  # Use 'author' or the correct field name here
		return Response({"post_count": post_count}, status=status.HTTP_200_OK)


class UserPostsView(APIView):
	permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

	def get(self, request, user_id, *args, **kwargs):
		# Ensure the user accessing the posts is the one whose posts we're fetching
		if request.user.id != user_id:
			return Response({"detail": "You cannot view posts of another user."}, status=403)

		# Fetch posts for the given user ID
		posts = Post.objects.filter(author_id=user_id)  # Assuming Post has a `user` field (ForeignKey to User)
		serializer = PostSerializer(posts, many=True)
		return Response(serializer.data)
