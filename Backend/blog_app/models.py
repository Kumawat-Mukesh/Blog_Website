from autoslug import AutoSlugField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from django.utils.timezone import now
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
	is_admin = models.BooleanField(default=False)  # Admin role
	is_user = models.BooleanField(default=True)  # Regular user role
	date_of_birth = models.DateField(null=True, blank=True)
	profile_picture = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	bio = models.TextField(max_length=250, blank=True, null=True)

	def __str__(self):
		return self.username

	@property
	def role(self):
		"""Determine user role based on flags."""
		if self.is_superuser:
			return "Superuser"
		elif self.is_admin:
			return "Admin"
		elif self.is_user:
			return "User"
		return "Unknown"


class AdminManager(models.Manager):
	"""Manager for Admin users."""

	def get_queryset(self):
		return super().get_queryset().filter(is_admin=True, is_superuser=False)


class UserManager(models.Manager):
	"""Manager for Regular users."""

	def get_queryset(self):
		return super().get_queryset().filter(is_user=True, is_superuser=False)


class Admin(CustomUser):
	objects = AdminManager()

	class Meta:
		proxy = True
		verbose_name = "Admin"
		verbose_name_plural = "Admins"

	def save(self, *args, **kwargs):
		self.is_admin = True
		self.is_user = False
		super().save(*args, **kwargs)

	def get_total_users(self):
		"""Get total number of regular users in the system."""
		return User.objects.count()

	def get_total_users_created_today(self):
		"""Get total number of users created today."""
		return User.objects.filter(created_at__date=now().date()).count()

	def promote_to_admin(self, user):
		"""Promote a regular user to admin."""
		if not user.is_admin:
			user.is_admin = True
			user.is_user = False
			user.save()


class User(CustomUser):
	objects = UserManager()

	class Meta:
		proxy = True
		verbose_name = "User"
		verbose_name_plural = "Users"

	def save(self, *args, **kwargs):
		self.is_admin = False
		self.is_user = True
		super().save(*args, **kwargs)

	def get_profile_info(self):
		"""Return user's profile information."""
		return {
			"username": self.username,
			"email": self.email,
			"date_of_birth": self.date_of_birth,
			"profile_picture": self.profile_picture.url if self.profile_picture else None,
			"bio": self.bio,
		}


# Category Model
class Category(models.Model):
	name = models.CharField(max_length=100, unique=True)
	slug = AutoSlugField(populate_from='name', unique=True, editable=False)

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.name


class Post(models.Model):
	title = models.CharField(max_length=255)
	slug = models.SlugField(unique=True, blank=True)
	author = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name="posts")
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	is_published = models.BooleanField(default=False)
	category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
	image = models.ImageField(upload_to='post_images/', blank=True, null=True)

	# Relationship to PostAnalytics model
	analytics = models.OneToOneField(
		'PostAnalytics', on_delete=models.CASCADE, related_name='post_analytics', null=True, blank=True
	)

	def __str__(self):
		return self.title

	def get_absolute_url(self):
		return reverse("post_detail", kwargs={"slug": self.slug})

	def clean(self):
		"""Validate that either a title or content is provided."""
		if not self.content and not self.title:
			raise ValidationError("A post must have either content or a title.")

	def increment_views(self):
		"""Increment view count in PostAnalytics."""
		if not self.analytics:
			self.analytics = PostAnalytics.objects.create(post=self)
		self.analytics.views += 1
		self.analytics.save()
		self.save()

	def increment_likes(self):
		"""Increment the like count."""
		if self.analytics:
			self.analytics.likes += 1
			self.analytics.save()

	def decrement_likes(self):
		"""Decrement the like count."""
		if self.analytics:
			self.analytics.likes -= 1
			self.analytics.save()

	def save(self, *args, **kwargs):
		# Handle image replacement
		if self.pk:
			old_instance = Post.objects.filter(pk=self.pk).first()
			if old_instance and old_instance.image != self.image:
				old_instance.image.delete(save=False)

		# Ensure slug is generated if not provided
		if not self.slug:
			self.slug = slugify(self.title)

		super().save(*args, **kwargs)
	def delete(self, *args, **kwargs):
		"""Delete the post and its associated image if exists."""
		# Delete the image file if it exists
		if self.image:
			try:
				# Get the file path of the image
				image_path = self.image.path
				# Check if the file exists and delete it
				if os.path.isfile(image_path):
					os.remove(image_path)
			except Exception as e:
				print(f"Error deleting image: {e}")

		# Now delete the post itself
		super().delete(*args, **kwargs)


# Comment Model
class Comment(models.Model):
	post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
	author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Comment by {self.author.username} on {self.post.title}"


class PostAnalytics(models.Model):
	post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name="post_analytics")
	views = models.PositiveIntegerField(default=0)
	likes = models.PositiveIntegerField(default=0)
	viewed_users = models.ManyToManyField(get_user_model(), related_name='viewed_posts', blank=True)

	def __str__(self):
		return f"Analytics for {self.post.title}"

	def reset_analytics(self):
		"""Method to reset views and likes."""
		self.views = 0
		self.likes = 0
		self.save()


class Follow(models.Model):
	follower = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
	followed = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('follower', 'followed')  # Prevent duplicate follows

	def __str__(self):
		return f"{self.follower.username} follows {self.followed.username}"

	def clean(self):
		# Prevent a user from following themselves
		if self.follower == self.followed:
			raise ValidationError("A user cannot follow themselves.")


# # Signal to create Profile when CustomUser is created
# @receiver(post_save, sender=CustomUser)
# def create_user_profile(sender, instance, created, **kwargs):
#     if created:
#         Profile.objects.create(user=instance)


# Post-like functionality (extendable for additional interaction, such as dislikes, comments, etc.)
class PostLike(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Like by {self.user.username} on {self.post.title}"

	class Meta:
		unique_together = ('user', 'post')  # Ensure a user can only like a post once
