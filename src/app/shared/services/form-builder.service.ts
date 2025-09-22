import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormTemplate, FormField } from '../../../app/features/dashboard/components/form-builder/form-builder';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private formsSubject = new BehaviorSubject<FormTemplate[]>([]);
  public forms$ = this.formsSubject.asObservable();

  private currentFormSubject = new BehaviorSubject<FormTemplate | null>(null);
  public currentForm$ = this.currentFormSubject.asObservable();

  constructor() {
    this.loadFormsFromStorage();
  }

  // Save form to local storage (replace with API calls)
  saveForm(form: FormTemplate): Observable<FormTemplate> {
    return new Observable(observer => {
      try {
        const forms = this.getForms();
        const existingIndex = forms.findIndex(f => f.id === form.id);

        if (existingIndex > -1) {
          forms[existingIndex] = { ...form, updatedAt: new Date() };
        } else {
          forms.push({ ...form, createdAt: new Date(), updatedAt: new Date() });
        }

        localStorage.setItem('formBuilder_forms', JSON.stringify(forms));
        this.formsSubject.next(forms);
        observer.next(form);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  // Load forms from local storage
  loadForms(): Observable<FormTemplate[]> {
    return new Observable(observer => {
      try {
        const forms = this.getForms();
        this.formsSubject.next(forms);
        observer.next(forms);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  // Get form by ID
  getFormById(id: string): Observable<FormTemplate | null> {
    return new Observable(observer => {
      try {
        const forms = this.getForms();
        const form = forms.find(f => f.id === id) || null;
        observer.next(form);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  // Delete form
  deleteForm(id: string): Observable<boolean> {
    return new Observable(observer => {
      try {
        const forms = this.getForms().filter(f => f.id !== id);
        localStorage.setItem('formBuilder_forms', JSON.stringify(forms));
        this.formsSubject.next(forms);
        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  // Duplicate form
  duplicateForm(form: FormTemplate): Observable<FormTemplate> {
    const duplicatedForm: FormTemplate = {
      ...form,
      id: this.generateId(),
      title: `${form.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: form.fields.map(field => ({
        ...field,
        id: this.generateId()
      }))
    };

    return this.saveForm(duplicatedForm);
  }

  // Set current form for editing
  setCurrentForm(form: FormTemplate | null): void {
    this.currentFormSubject.next(form);
  }

  // Create new blank form
  createNewForm(): FormTemplate {
    return {
      id: this.generateId(),
      title: 'Untitled Form',
      description: 'Enter form description here',
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Validate form structure
  validateForm(form: FormTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!form.title || form.title.trim().length === 0) {
      errors.push('Form title is required');
    }

    if (form.fields.length === 0) {
      errors.push('At least one field is required');
    }

    form.fields.forEach((field, index) => {
      if (!field.label || field.label.trim().length === 0) {
        errors.push(`Field ${index + 1}: Label is required`);
      }

      if (this.needsOptions(field.type) && (!field.options || field.options.length === 0)) {
        errors.push(`Field "${field.label}": Options are required`);
      }

      if (field.validation) {
        if (field.validation.minLength && field.validation.maxLength) {
          if (field.validation.minLength > field.validation.maxLength) {
            errors.push(`Field "${field.label}": Min length cannot be greater than max length`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export form as JSON
  exportForm(form: FormTemplate): string {
    return JSON.stringify(form, null, 2);
  }

  // Import form from JSON
  importForm(jsonString: string): Observable<FormTemplate> {
    return new Observable(observer => {
      try {
        const form: FormTemplate = JSON.parse(jsonString);

        // Validate imported form structure
        const validation = this.validateForm(form);
        if (!validation.isValid) {
          observer.error(new Error(`Invalid form structure: ${validation.errors.join(', ')}`));
          return;
        }

        // Generate new ID for imported form
        form.id = this.generateId();
        form.createdAt = new Date();
        form.updatedAt = new Date();

        // Generate new IDs for all fields
        form.fields.forEach(field => {
          field.id = this.generateId();
        });

        observer.next(form);
        observer.complete();
      } catch (error) {
        observer.error(new Error('Invalid JSON format'));
      }
    });
  }

  // Private helper methods
  private getForms(): FormTemplate[] {
    try {
      const formsJson = localStorage.getItem('formBuilder_forms');
      return formsJson ? JSON.parse(formsJson) : [];
    } catch {
      return [];
    }
  }

  private loadFormsFromStorage(): void {
    const forms = this.getForms();
    this.formsSubject.next(forms);
  }

  private needsOptions(type: string): boolean {
    return ['select', 'checkbox', 'radio'].includes(type);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
