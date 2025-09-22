import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormTemplate } from '../components/form-builder/form-builder';
import { FormBuilderService } from '../../../shared/services/form-builder.service';

@Component({
  selector: 'app-form-management',
  standalone: false,
  templateUrl: './form-management.html',
  styleUrls: ['./form-management.scss']
})
export class FormsManagementComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  forms: FormTemplate[] = [];
  filteredForms: FormTemplate[] = [];
  searchTerm = '';
  sortBy = 'updatedAt';
  activeDropdown: string | null = null;
  previewingForm: FormTemplate | null = null;
  deletingForm: FormTemplate | null = null;

  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilderService: FormBuilderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadForms();
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.activeDropdown = null;
    });
  }

  loadForms() {
    this.formBuilderService.loadForms().subscribe({
      next: (forms) => {
        this.forms = forms;
        this.filterForms();
      },
      error: (error) => {
        this.showError('Failed to load forms');
      }
    });
  }

  createNewForm() {
    const newForm = this.formBuilderService.createNewForm();
    this.formBuilderService.setCurrentForm(newForm);
    this.router.navigate(['/form-builder']);
  }

  editForm(form: FormTemplate) {
    this.formBuilderService.setCurrentForm(form);
    this.router.navigate(['/form-builder']);
  }

  duplicateForm(form: FormTemplate) {
    this.formBuilderService.duplicateForm(form).subscribe({
      next: (duplicatedForm) => {
        this.showSuccess('Form duplicated successfully');
        this.loadForms();
      },
      error: (error) => {
        this.showError('Failed to duplicate form');
      }
    });
  }

  deleteForm(form: FormTemplate) {
    this.deletingForm = form;
  }

  confirmDelete() {
    if (this.deletingForm) {
      this.formBuilderService.deleteForm(this.deletingForm.id).subscribe({
        next: () => {
          this.showSuccess('Form deleted successfully');
          this.deletingForm = null;
          this.loadForms();
        },
        error: (error) => {
          this.showError('Failed to delete form');
          this.deletingForm = null;
        }
      });
    }
  }

  cancelDelete() {
    this.deletingForm = null;
  }

  previewForm(form: FormTemplate) {
    this.previewingForm = form;
  }

  closePreview() {
    this.previewingForm = null;
  }

  onPreviewSubmit(formData: any) {
    console.log('Preview form submitted:', formData);
    this.showSuccess('Form submitted successfully (preview mode)');
  }

  exportForm(form: FormTemplate) {
    try {
      const jsonString = this.formBuilderService.exportForm(form);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      this.showSuccess('Form exported successfully');
    } catch (error) {
      this.showError('Failed to export form');
    }
  }

  onImportForm(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          this.formBuilderService.importForm(jsonString).subscribe({
            next: (importedForm) => {
              this.formBuilderService.saveForm(importedForm).subscribe({
                next: () => {
                  this.showSuccess('Form imported successfully');
                  this.loadForms();
                },
                error: () => {
                  this.showError('Failed to save imported form');
                }
              });
            },
            error: (error) => {
              this.showError(error.message || 'Failed to import form');
            }
          });
        } catch (error) {
          this.showError('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    this.fileInput.nativeElement.value = '';
  }

  filterForms() {
    let filtered = [...this.forms];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(form =>
        form.title.toLowerCase().includes(term) ||
        form.description.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    this.filteredForms = this.sortFormsList(filtered);
  }

  sortForms() {
    this.filteredForms = this.sortFormsList(this.filteredForms);
  }

  private sortFormsList(forms: FormTemplate[]): FormTemplate[] {
    return forms.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'fields':
          return b.fields.length - a.fields.length;
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterForms();
  }

  toggleDropdown(formId: string) {
    this.activeDropdown = this.activeDropdown === formId ? null : formId;
  }

  getRequiredFieldsCount(form: FormTemplate): number {
    return form.fields.filter(field => field.required).length;
  }

  hasValidation(form: FormTemplate): boolean {
    return form.fields.some(field =>
      field.validation &&
      (field.validation.minLength || field.validation.maxLength || field.validation.pattern)
    );
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 5000);
  }
}
