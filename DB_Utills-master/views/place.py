from models import place
from typing import Any
from urllib.parse import urlencode

from sqladmin import ModelView
from sqladmin.helpers import get_object_identifier, slugify_class_name
from starlette.requests import Request


class PlaceAdmin(ModelView, model=place):
    column_list = [
        place.id,
        place.name
    ]
    form_include_pk = True
    form_columns = [
        place.id,
        place.name
    ]

    # def _url_for_delete(self, request: Request, obj: Any) -> str:
    #     pk = get_object_identifier(obj)
    #     query_params = urlencode({"pks": pk})
    #     url = request.url_for(
    #         "admin:delete", identity=slugify_class_name(obj.__class__.__name__)
    #     )
    #     url = str(url).replace("http:", "https:")
    #     return str(url) + "?" + query_params
