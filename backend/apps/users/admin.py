from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

# 1. Create a custom action to approve multiple people at once
@admin.action(description="Verify selected organizers")
def verify_organizers(modeladmin, request, queryset):
    # Only verify users who actually applied to be organizers
    organizers_to_verify = queryset.filter(role='organizer')
    updated_count = organizers_to_verify.update(is_verified_organizer=True)
    modeladmin.message_user(
        request, 
        f"Successfully verified {updated_count} organizer(s)."
    )

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'get_full_name', 'role', 'is_verified_organizer', 'is_active', 'date_joined']
    
    # 2. Make the checkbox editable right from the main table!
    list_editable = ['is_verified_organizer'] 
    
    list_filter = ['role', 'is_active', 'is_verified_organizer']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    # 3. Register the custom bulk action
    actions = [verify_organizers]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'phone', 'avatar', 'bio')}),
        ('Role', {'fields': ('role', 'organization_name', 'is_verified_organizer')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2')}),
    )