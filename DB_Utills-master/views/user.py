from models import User
from typing import Any
from urllib.parse import urlencode

from sqladmin import ModelView
from sqladmin.helpers import get_object_identifier, slugify_class_name
from starlette.requests import Request


class UserAdmin(ModelView, model=User):
    column_list = [
        User.id,
        User.telegram_id,
        User.username,
        User.first_name,
        User.age,
        User.city,
        User.count_tests
    ]
    form_include_pk = True
    form_columns = [
        User.id,
        User.telegram_id,
        User.username,
        User.first_name,
        User.age,
        User.city,
        User.count_tests
    ]

    # def _url_for_delete(self, request: Request, obj: Any) -> str:
    #     pk = get_object_identifier(obj)
    #     query_params = urlencode({"pks": pk})
    #     url = request.url_for(
    #         "admin:delete", identity=slugify_class_name(obj.__class__.__name__)
    #     )
    #     url = str(url).replace("http:", "https:")
    #     return str(url) + "?" + query_params
