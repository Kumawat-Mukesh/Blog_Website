from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import *


class CustomUserAdmin(BaseUserAdmin):
	"""Admin interface for CustomUser"""
	model = CustomUser
	list_display = (
		'username', 'email', 'role', 'is_active', 'date_of_birth', 'profile_picture', 'created_at', 'updated_at')
	list_filter = ('is_active', 'is_admin', 'is_user', 'created_at')
	search_fields = ('username', 'email', 'first_name', 'last_name')
	ordering = ('-created_at',)
	fieldsets = (
		(None, {'fields': ('username', 'password')}),
		(_('Personal info'),
		 {'fields': ('first_name', 'last_name', 'email', 'date_of_birth', 'profile_picture', 'bio')}),
		(_('Permissions'), {'fields': ('is_active', 'is_admin', 'is_user', 'is_superuser')}),
		(_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
	)
	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('username', 'password1', 'password2', 'email', 'first_name', 'last_name', 'date_of_birth',
			           'profile_picture', 'bio', 'is_admin', 'is_user', 'is_active'),
		}),
	)
	readonly_fields = ('created_at', 'updated_at', 'last_login')

	def role(self, obj):
		return obj.role

	role.short_description = 'Role'


class AdminAdmin(admin.ModelAdmin):
	"""Admin interface for Admin model"""
	list_display = (
		'username', 'email', 'first_name', 'last_name', 'get_total_users', 'get_total_users_created_today', 'is_active',
		'date_of_birth', 'profile_picture', 'created_at')
	list_filter = ('is_active', 'created_at')
	search_fields = ('username', 'email', 'first_name', 'last_name')
	ordering = ('-created_at',)
	actions = ['promote_user_to_admin']

	def promote_user_to_admin(self, request, queryset):
		"""Promote selected users to admin."""
		for user in queryset:
			if not user.is_admin:
				user.is_admin = True
				user.is_user = False
				user.save()
		self.message_user(request, "Selected users have been promoted to admin.")

	promote_user_to_admin.short_description = "Promote selected users to admin"

	def get_total_users(self, obj):
		"""Total number of regular users."""
		return User.objects.count()

	get_total_users.short_description = "Total Users"

	def get_total_users_created_today(self, obj):
		"""Total number of users created today."""
		return User.objects.filter(created_at__date=now().date()).count()

	get_total_users_created_today.short_description = "Total Users Created Today"


class UserAdmin(admin.ModelAdmin):
	"""Admin interface for User model"""
	list_display = (
		'username', 'email', 'first_name', 'last_name', 'is_active', 'date_of_birth', 'profile_picture', 'created_at')
	list_filter = ('is_active', 'created_at')
	search_fields = ('username', 'email', 'first_name', 'last_name')
	ordering = ('-created_at',)
	readonly_fields = ('created_at', 'updated_at')

	def get_profile_info(self, obj):
		"""Show user's profile information."""
		return f"{obj.username} - {obj.email} - {obj.date_of_birth}"

	get_profile_info.short_description = "Profile Info"


# Register the models with the customized admin classes
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Admin, AdminAdmin)
admin.site.register(User, UserAdmin)


# Register the Post model with the admin
class PostAdmin(admin.ModelAdmin):
	list_display = ('title', 'author', 'created_at', 'updated_at', 'is_published', 'category')
	search_fields = ('title', 'author__username', 'category__name')
	list_filter = ('is_published', 'created_at', 'updated_at', 'category')


# prepopulated_fields = {'slug': ('title',)}


admin.site.register(Post, PostAdmin)


# Register the Comment model with the admin
class CommentAdmin(admin.ModelAdmin):
	list_display = ('author', 'post', 'created_at', 'content')
	search_fields = ('author__username', 'post__title', 'content')
	list_filter = ('created_at',)


admin.site.register(Comment, CommentAdmin)


class CategoryAdmin(admin.ModelAdmin):
	list_display = ('name',)  # Show name and slug in the list view


# prepopulated_fields = {'slug': ('name',)}  # Automatically generate slug from name
# exclude = ('slug',)
# readonly_fields = ('slug',)


admin.site.register(Category, CategoryAdmin)


# Register the PostAnalytics model with the admin
class PostAnalyticsAdmin(admin.ModelAdmin):
	list_display = ('post', 'views', 'likes')
	search_fields = ('post__title',)
	list_filter = ('post',)


admin.site.register(PostAnalytics, PostAnalyticsAdmin)


# Register the Follow model with the admin
class FollowAdmin(admin.ModelAdmin):
	list_display = ('follower', 'followed', 'created_at')
	search_fields = ('follower__username', 'followed__username')
	list_filter = ('created_at',)


admin.site.register(Follow, FollowAdmin)


# Register the PostLike model with the admin
class PostLikeAdmin(admin.ModelAdmin):
	list_display = ('user', 'post', 'created_at')
	search_fields = ('user__username', 'post__title')
	list_filter = ('created_at',)


admin.site.register(PostLike, PostLikeAdmin)
