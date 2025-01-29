from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
	"""
	Custom pagination for all views. You can control the page size and allow clients to modify it
	using the `page_size` query parameter. This pagination can be applied across all views in the project.
	"""
	page_size = 10  # Default number of items per page
	page_size_query_param = 'page_size'  # Allow clients to modify the page size
	max_page_size = 100  # Max number of items per page that can be requested
