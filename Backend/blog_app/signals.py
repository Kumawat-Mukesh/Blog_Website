from django.db.models.signals import post_delete
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import *


@receiver(post_save, sender=Post)
def create_post_analytics(sender, instance, created, **kwargs):
	if created and not hasattr(instance, 'analytics'):
		PostAnalytics.objects.create(post=instance)


# Signal to handle likes when a PostLike instance is created
@receiver(post_save, sender=PostLike)
def handle_post_like(sender, instance, created, **kwargs):
	if created:
		instance.post.increment_likes()


# Signal to delete the image file when the Post instance is deleted
@receiver(post_delete, sender=Post)
def delete_image_on_post_delete(sender, instance, **kwargs):
	if instance.image:
		instance.image.delete(save=False)
