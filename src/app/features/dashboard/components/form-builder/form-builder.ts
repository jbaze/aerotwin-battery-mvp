import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, DragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  position: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}
@Component({
  selector: 'app-form-builder',
  standalone: true,
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.scss',
  imports: [CommonModule,FormsModule,DragDropModule],
})
export class FormBuilderComponent implements OnInit {
  fieldTypes = [
    { type: 'text', label: 'Text Input', description: 'Single line text' },
    { type: 'email', label: 'Email', description: 'Email address' },
    { type: 'phone', label: 'Phone', description: 'Phone number' },
    { type: 'number', label: 'Number', description: 'Numeric input' },
    { type: 'textarea', label: 'Long Text', description: 'Multi-line text' },
    { type: 'select', label: 'Dropdown', description: 'Select from options' },
    { type: 'checkbox', label: 'Checkboxes', description: 'Multiple selection' },
    { type: 'radio', label: 'Radio Buttons', description: 'Single selection' },
    { type: 'date', label: 'Date', description: 'Date picker' },
    { type: 'file', label: 'File Upload', description: 'File attachment' }
  ];

  currentForm: FormTemplate = {
    id: '',
    title: 'Untitled Form',
    description: 'Enter form description here',
    fields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  selectedField: FormField | null = null;
  showPreview = false;

  ngOnInit() {
    this.currentForm.id = this.generateId();
  }

  onFieldDrop(event: CdkDragDrop<any[]>) {
    console.log('Drop event:', event); // Debug log

    if (event.previousContainer === event.container) {
      // Reordering within the form
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateFieldPositions();
    } else {
      // Adding new field from palette
      const draggedData = event.item.data || event.previousContainer.data[event.previousIndex];
      console.log('Dragged data:', draggedData); // Debug log

      if (draggedData) {
        const newField = this.createField(draggedData.type, draggedData.label);

        // Insert at the correct position
        if (event.currentIndex >= this.currentForm.fields.length) {
          this.currentForm.fields.push(newField);
        } else {
          this.currentForm.fields.splice(event.currentIndex, 0, newField);
        }

        this.updateFieldPositions();
        this.selectedField = newField;
        console.log('New field added:', newField); // Debug log
      }
    }
  }

  createField(type: string, label: string): FormField {
    const field: FormField = {
      id: this.generateId(),
      type: type as FormField['type'],
      label: label,
      required: false,
      position: this.currentForm.fields.length
    };

    // Set default placeholder
    if (this.needsPlaceholder(field.type)) {
      field.placeholder = `Enter ${label.toLowerCase()}`;
    }

    // Initialize options for select/checkbox/radio
    if (this.needsOptions(field.type)) {
      field.options = ['Option 1', 'Option 2'];
    }

    // Initialize validation for text-based fields
    if (this.needsValidation(field.type)) {
      field.validation = {};
    }

    return field;
  }

  editField(field: FormField) {
    this.selectedField = field;
  }

  removeField(fieldId: string) {
    const index = this.currentForm.fields.findIndex(f => f.id === fieldId);
    if (index > -1) {
      this.currentForm.fields.splice(index, 1);
      this.updateFieldPositions();
      if (this.selectedField?.id === fieldId) {
        this.selectedField = null;
      }
    }
  }

  addOption() {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.push(`Option ${this.selectedField.options.length + 1}`);
    }
  }

  removeOption(index: number) {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.splice(index, 1);
    }
  }

  needsPlaceholder(type: string): boolean {
    return ['text', 'email', 'phone', 'number', 'textarea'].includes(type);
  }

  needsOptions(type: string): boolean {
    return ['select', 'checkbox', 'radio'].includes(type);
  }

  needsValidation(type: string): boolean {
    return ['text', 'email', 'phone', 'textarea'].includes(type);
  }

  updateFieldPositions() {
    this.currentForm.fields.forEach((field, index) => {
      field.position = index;
    });
  }

  previewForm() {
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
  }

  saveForm() {
    this.currentForm.updatedAt = new Date();
    // Here you would typically save to a service or API
    console.log('Form saved:', this.currentForm);
    alert('Form saved successfully!');
  }

  trackByFieldId(index: number, field: FormField): string {
    return field.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
