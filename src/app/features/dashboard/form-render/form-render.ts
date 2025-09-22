import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormTemplate } from '../components/form-builder/form-builder';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-render',
  standalone: false,
  templateUrl: './form-render.html',
  styleUrls: ['./form-render.scss']
})
export class FormRenderComponent implements OnInit {
  @Input() formTemplate!: FormTemplate;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<any>();

  dynamicForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    const formControls: { [key: string]: FormControl } = {};

    this.formTemplate.fields.forEach(field => {
      const validators = [];

      // Required validation
      if (field.required) {
        validators.push(Validators.required);
      }

      // Email validation
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      // Length validations
      if (field.validation) {
        if (field.validation.minLength) {
          validators.push(Validators.minLength(field.validation.minLength));
        }
        if (field.validation.maxLength) {
          validators.push(Validators.maxLength(field.validation.maxLength));
        }
        if (field.validation.pattern) {
          validators.push(Validators.pattern(field.validation.pattern));
        }
      }

      // Initialize form control
      const initialValue = field.type === 'checkbox' ? [] : '';
      formControls[field.id] = new FormControl(initialValue, validators);
    });

    this.dynamicForm = this.fb.group(formControls);

    // Subscribe to form changes
    this.dynamicForm.valueChanges.subscribe(value => {
      this.formChange.emit(value);
    });
  }

  onCheckboxChange(fieldId: string, option: string, event: any) {
    const control = this.dynamicForm.get(fieldId);
    if (control) {
      const currentValue: string[] = control.value || [];
      if (event.target.checked) {
        currentValue.push(option);
      } else {
        const index = currentValue.indexOf(option);
        if (index > -1) {
          currentValue.splice(index, 1);
        }
      }
      control.setValue(currentValue);
    }
  }

  onFileChange(fieldId: string, event: any) {
    const control = this.dynamicForm.get(fieldId);
    if (control && event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      control.setValue(file);
    }
  }

  isFieldInvalid(fieldId: string): boolean {
    const control = this.dynamicForm.get(fieldId);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.dynamicForm.valid) {
      this.isSubmitting = true;
      const formValue = this.dynamicForm.value;

      // Simulate API call
      setTimeout(() => {
        this.formSubmit.emit(formValue);
        this.isSubmitting = false;
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.get(key)?.markAsTouched();
      });
    }
  }
}
