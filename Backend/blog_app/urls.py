from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import *

router = DefaultRouter()

router.register(r'posts', PostViewSet, basename='post')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'analytics', PostAnalyticsViewSet, basename='analytics')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'users', FollowViewSet, basename='user-follow')

urlpatterns = [
	# Custom app endpoints
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', LoginView.as_view(), name='login'),
	path('profile/', UserProfileView.as_view(), name='profile'),
	path('users-list/', UserListView.as_view(), name='user-list'),
	path('users/<str:username>/profile/', UserProfileView.as_view(), name='user-profile'),

	# Include all routes from the router
	path('', include(router.urls)),

	# Custom actions
	path('posts/<slug:slug>/like/', PostViewSet.as_view({'post': 'like'}), name='post-like'),
	path('posts/<slug>/increment_views/', PostViewSet.as_view({'post': 'increment_views'})),

	# Comments related to a specific post
	path('posts/<slug>/comments/', CommentViewSet.as_view({'post': 'create', 'get': 'list'}), name='post-comments'),

	# User-related actions
	
	path('users/<int:id>/check-follow/', FollowViewSet.as_view({'get': 'check_follow'}), name='check-follow-status'),
	path('users/<int:id>/followers/', FollowViewSet.as_view({'get': 'followers'}), name='user-followers'),  # New route
	path('users/<int:id>/following/', FollowViewSet.as_view({'get': 'following'}), name='user-following'),  # New route

	# Count-related actions
	path('user/<int:user_id>/post-count/', UserPostCountView.as_view(), name='user-post-count'),
	path('user/<int:user_id>/followers-count/', UserFollowersCountView.as_view(), name='user-followers-count'),
	path('user/<int:user_id>/following-count/', UserFollowingCountView.as_view(), name='user-following-count'),
	path('users/<int:user_id>/posts/', UserPostsView.as_view(), name='user-posts'),

	# Post CRUD
	path('posts/<slug:slug>/', PostViewSet.as_view({
		'get': 'retrieve',
		'put': 'update',
		'patch': 'partial_update',
		'delete': 'destroy'
	}), name='post-detail'),

	# Password reset endpoints
	path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
	path('password-reset/<int:uid>/<str:token>/', PasswordResetView.as_view(), name='password-reset'),
]
