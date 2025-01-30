from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password

from .models import *

CustomUser = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	profile_picture = serializers.ImageField(required=False)

	class Meta:
		model = CustomUser
		fields = ['username', 'email', 'password', 'date_of_birth', 'profile_picture', 'bio']

	def validate(self, data):
		# Validate email uniqueness
		if CustomUser.objects.filter(username=data['username']).exists():
			raise ValidationError("A user with this username already exists.")
		if CustomUser.objects.filter(email=data['email']).exists():
			raise ValidationError("A user with this email already exists.")
		return data

	def create(self, validated_data):
		# Hashing the password before saving
		user = CustomUser(
			username=validated_data['username'],
			email=validated_data['email'],
			date_of_birth=validated_data.get('date_of_birth', None),
			bio=validated_data.get('bio', '')
		)
		user.set_password(validated_data['password'])

		if 'profile_picture' in validated_data:
			user.profile_picture = validated_data['profile_picture']

		user.save()
		return user


class LoginSerializer(serializers.Serializer):
	username = serializers.CharField()
	password = serializers.CharField(write_only=True)

	def validate(self, data):
		username = data.get('username')
		password = data.get('password')

		user = authenticate(username=username, password=password)
		if user is None:
			raise serializers.ValidationError("Invalid username or password")

		refresh = RefreshToken.for_user(user)
		return {
			'refresh': str(refresh),
			'access': str(refresh.access_token),
			'user': {
				'username': user.username,
				'email': user.email,
				'role': user.role,
			}
		}


class UserProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['id', 'username', 'email', 'date_of_birth', 'profile_picture', 'is_admin', 'is_user', 'created_at',
		          'updated_at', 'bio']
		read_only_fields = ['is_admin', 'is_user', 'created_at', 'updated_at']

	def update(self, instance, validated_data):
		# Check if a new profile picture is provided
		profile_picture = validated_data.pop("profile_picture", None)
		if profile_picture:
			# Remove the old profile picture if it exists
			if instance.profile_picture and default_storage.exists(instance.profile_picture.name):
				default_storage.delete(instance.profile_picture.name)
			instance.profile_picture = profile_picture

		# Update other fields dynamically
		for attr, value in validated_data.items():
			setattr(instance, attr, value)

		instance.save()
		return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user with this email address exists.")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        
        # Logic to generate reset link or token (you can implement this as needed)

        return user

class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise ValidationError("Passwords do not match.")
        return data

    def save(self):
        user = self.context["user"]
        user.set_password(self.validated_data["new_password"])
        user.save()

# ----------------------------------------------------------------
class PostSerializer(serializers.ModelSerializer):
	author = UserProfileSerializer(read_only=True)
	category = serializers.CharField(required=False)  # Accepts category name as a string
	image = serializers.ImageField(required=False)
	analytics = serializers.SerializerMethodField()

	class Meta:
		model = Post
		fields = '__all__'

	def get_analytics(self, obj):
		try:
			analytics = PostAnalytics.objects.get(post=obj)
			comment_count = obj.comments.count()
			return {
				'views': analytics.views,
				'likes': analytics.likes,
				'comments': comment_count
			}
		except PostAnalytics.DoesNotExist:
			return {
				'views': 0,
				'likes': 0,
				'comments': 0
			}

	# In the serializer's create method
	def create(self, validated_data):
		category_data = validated_data.pop('category', None)

		# Handle category creation or assignment
		if category_data:
			if isinstance(category_data, dict):  # Handle category passed as a dict (with id and name)
				try:
					category_instance = Category.objects.get(id=category_data['category'])
				except Category.DoesNotExist:
					raise serializers.ValidationError(f"Category with ID {category_data['category']} does not exist.")
			else:  # Handle category as just an ID
				try:
					category_instance = Category.objects.get(
						id=int(category_data))  # Cast to integer to ensure proper ID
				except Category.DoesNotExist:
					raise serializers.ValidationError(f"Category with ID {category_data} does not exist.")
			validated_data['category'] = category_instance
		else:
			validated_data['category'] = None  # Explicitly set category as None if not provided

		# Create the post instance
		post = Post.objects.create(**validated_data)

		return post

	def handle_category(self, category_data):
		"""
		Helper method to handle category assignment or creation based on the name.
		"""
		if category_data:
			try:
				# Retrieve category by name
				return Category.objects.get(name=category_data)
			except Category.DoesNotExist:
				raise serializers.ValidationError(f"Category with name '{category_data}' does not exist.")
		return None

	def update(self, instance, validated_data):
		category_name = validated_data.pop('category', None)
		if category_name:
			try:
				category_instance = Category.objects.get(name=category_name)  # Get category by name
				instance.category = category_instance
			except Category.DoesNotExist:
				raise serializers.ValidationError(f"Category with name {category_name} does not exist.")

		# Update image if provided
		if 'image' in validated_data:
			instance.image = validated_data['image']

		# Update other fields
		for attr, value in validated_data.items():
			setattr(instance, attr, value)

		instance.save()
		return instance


# Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
	author = UserProfileSerializer(read_only=True)
	post_title = serializers.CharField(source='post.title',
	                                   read_only=True)  # Assuming 'title' is a field in the Post model
	post = serializers.SlugRelatedField(slug_field='slug', queryset=Post.objects.all())

	class Meta:
		model = Comment
		fields = "__all__"

	def create(self, validated_data):
		return Comment.objects.create(**validated_data)


# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = ['id', 'name', 'slug']


# PostAnalytics Serializer
class PostAnalyticsSerializer(serializers.ModelSerializer):
	class Meta:
		model = PostAnalytics
		fields = ['id', 'post', 'views', 'likes']


class FollowSerializer(serializers.ModelSerializer):
	follower = UserProfileSerializer(read_only=True)
	followed = UserProfileSerializer(read_only=True)

	class Meta:
		model = Follow
		fields = ['id', 'follower', 'followed', 'created_at']

	def create(self, validated_data):
		# Extract the follower and followed user
		follower = validated_data['follower']
		followed = validated_data['followed']

		# Prevent user from following themselves
		if follower == followed:
			raise serializers.ValidationError("A user cannot follow themselves.")

		# Proceed to create the Follow record
		return Follow.objects.create(**validated_data)


# PostLike Serializer
class PostLikeSerializer(serializers.ModelSerializer):
	user = UserProfileSerializer(read_only=True)
	post = serializers.SlugRelatedField(slug_field='slug', queryset=Post.objects.all())

	class Meta:
		model = PostLike
		fields = ['id', 'user', 'post', 'created_at']

	def create(self, validated_data):
		post_like = PostLike.objects.create(**validated_data)
		return post_like
