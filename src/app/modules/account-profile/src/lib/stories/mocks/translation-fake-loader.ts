import type { TranslateLoader } from '@ngx-translate/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

const TRANSLATIONS: Record<string, any> = {
  es: {
    //COMMON
    'Common.LabelDay': 'Día',
    'Common.LabelMonth': 'Mes',
    'Common.LabelYear': 'Año',
    //ACCOUNT PROFILE
    'AccountProfile.Title': 'Mi perfil',
    'AccountProfile.Loading': 'Cargando la información de tu perfil...',
    'AccountProfile.Description':
      'Ingresa tus datos tal como aparecen en tu documento de identidad oficial. Esta información se utilizará para crear tu perfil y ahorrar tiempo durante el check-in.',
    //FORM PERSONAL
    'AccountProfile.PersonalForm.Title': 'Información personal',
    'AccountProfile.PersonalForm.Address_Label': 'Dirección',
    'AccountProfile.PersonalForm.Birthday_Label': 'Fecha de nacimiento',
    'AccountProfile.PersonalForm.City_Label': 'Ciudad',
    'AccountProfile.PersonalForm.Country_Label': 'País de residencia',
    'AccountProfile.PersonalForm.Gender_Label': 'Género',
    'AccountProfile.PersonalForm.LastName_Label': 'Apellido',
    'AccountProfile.PersonalForm.Name_Label': 'Nombre',
    'AccountProfile.PersonalForm.AddPersonalInformationButton_Label': 'Agregar información personal',

    'AccountProfile.PersonalForm.ErrorMessage.Gender_Required_Message': 'El género es obligatorio',
    'AccountProfile.PersonalForm.ErrorMessage.LastName_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.PersonalForm.ErrorMessage.Day_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.PersonalForm.ErrorMessage.Month_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.PersonalForm.ErrorMessage.Year_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.PersonalForm.ErrorMessage.Country_Required_Message': 'El país es obligatorio',
    'AccountProfile.PersonalForm.ErrorMessage.City_Required_Message': 'La ciudad es obligatoria',
    'AccountProfile.PersonalForm.ErrorMessage.City_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.PersonalForm.ErrorMessage.Address_Required_Message': 'La dirección es obligatoria',
    'AccountProfile.PersonalForm.ErrorMessage.Address_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.PersonalForm.ErrorMessage.FirstName_Required_Message': 'El nombre es obligatorio',
    'AccountProfile.PersonalForm.ErrorMessage.LastName_Required_Message': 'El apellido es obligatorio',
    'AccountProfile.PersonalForm.ErrorMessage.FirstName_InvalidPattern_Message': 'Por favor ingresa un carácter válido',

    //FORM CONTACT
    'AccountProfile.ContactForm.Title': 'Información de contacto',
    'AccountProfile.ContactForm.Email_Label': 'Correo electrónico',
    'AccountProfile.ContactForm.Phone_Label': 'Teléfono',
    'AccountProfile.ContactForm.Prefix_Label': 'Prefijo',
    'AccountProfile.ContactForm.PhoneNumber_Label': 'Número de teléfono',
    'AccountProfile.ContactForm.AddContactInformationButton_Label': 'Agregar información de contacto',

    'AccountProfile.ContactForm.ErrorMessage.Phone_Required_Message': 'El teléfono es obligatorio',
    'AccountProfile.ContactForm.ErrorMessage.Phone_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.ContactForm.ErrorMessage.Phone_Minlength_Message': 'La longitud mínima es de 6 caracteres',
    'AccountProfile.ContactForm.ErrorMessage.Phone_Maxlength_Message': 'La longitud máxima es de 15 caracteres',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Required_Message': 'El prefijo es obligatorio',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.ContactForm.ErrorMessage.Email_Required_Message': 'El correo electrónico es obligatorio',
    'AccountProfile.ContactForm.ErrorMessage.Email_InvalidPattern_Message': 'Por favor ingresa un email válido',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Minlength_Message': 'La longitud mínima es de 1 carácter',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Maxlength_Message': 'La longitud máxima es de 5 caracteres',

    //FORM EMERGENCY CONTACT
    'AccountProfile.EmergencyForm.Title': 'Contacto de emergencia',
    'AccountProfile.EmergencyForm.LastName_Label': 'Apellido',
    'AccountProfile.EmergencyForm.CompleteName_Label': 'Nombre',
    'AccountProfile.EmergencyForm.Phone_Label': 'Teléfono',
    'AccountProfile.EmergencyForm.PhoneNumber_Label': 'Número de teléfono',
    'AccountProfile.EmergencyForm.Prefix_Label': 'Prefijo',
    'AccountProfile.EmergencyForm.AddEmergencyContactButton_Label': 'Agregar contacto de emergencia',

    'AccountProfile.EmergencyForm.ErrorMessage.CompleteName_Required_Message': 'El nombre es obligatorio',
    'AccountProfile.EmergencyForm.ErrorMessage.CompleteName_InvalidPattern_Message':
      'Por favor ingresa un carácter válido',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Required_Message': 'El teléfono es obligatorio',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Minlength_Message': 'La longitud mínima es de 6 caracteres',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Maxlength_Message': 'La longitud máxima es de 15 caracteres',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Required_Message': 'El prefijo es obligatorio',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Minlength_Message': 'La longitud mínima es de 1 carácter',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Maxlength_Message': 'La longitud máxima es de 5 caracteres',

    //FORM TRAVEL DOCUMENTS
    'AccountProfile.DocumentsForm.MainDocument_Title': 'Documentos de viaje',
    'AccountProfile.DocumentsForm.SecondaryDocument_Title': 'Documento',
    'AccountProfile.DocumentsForm.Description':
      'Puedes guardar hasta dos documentos. Una vez agregados, el tipo de documento no se puede cambiar, así que asegúrate de seleccionar el correcto.',
    'AccountProfile.DocumentsForm.DocumentType_Label': 'Tipo de documento',
    'AccountProfile.DocumentsForm.DocumentExpirationDate_Title': 'Fecha de vencimiento',
    'AccountProfile.DocumentsForm.DocumentNationality_Label': 'Nacionalidad del documento',
    'AccountProfile.DocumentsForm.DocumentNumber_Label': 'Número de documento',
    'AccountProfile.DocumentsForm.AddDocumentButton_Label': 'Agregar documento de viaje',

    'AccountProfile.DocumentsForm.ErrorMessage.DocumentType_Required_Message': 'El tipo de documento es obligatorio',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Required_Message':
      'El número de documento es obligatorio',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNationality_Required_Message':
      'La nacionalidad del documento es obligatoria',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Pattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Min_Message': 'La longitud mínima es de 6 caracteres',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Max_Message': 'La longitud máxima es de 15 caracteres',
    'AccountProfile.DocumentsForm.ErrorMessage.Day_Required_Message':
      'La fecha de vencimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.DocumentsForm.ErrorMessage.Month_Required_Message':
      'La fecha de vencimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.DocumentsForm.ErrorMessage.Year_Required_Message':
      'La fecha de vencimiento está incompleta. Completa todos los campos requeridos.',

    //FORM COMPANIONS
    'AccountProfile.CompanionsForm.Title': 'Compañeros frecuentes',
    'AccountProfile.CompanionsForm.PaxForm_Label': 'Adulto:',
    'AccountProfile.CompanionsForm.Birthday_Label': 'Fecha de nacimiento',
    'AccountProfile.CompanionsForm.CompleteName_Label': 'Nombre / Apellido',
    'AccountProfile.CompanionsForm.Country_Label': 'País de residencia',
    'AccountProfile.CompanionsForm.Description': 'Puedes guardar hasta cuatro compañeros frecuentes',
    'AccountProfile.CompanionsForm.Gender_Label': 'Género',
    'AccountProfile.CompanionsForm.LastName_Label': 'Apellido',
    'AccountProfile.CompanionsForm.Lifemiles_Label': 'Lifemiles',
    'AccountProfile.CompanionsForm.Name_Label': 'Nombre',
    'AccountProfile.CompanionsForm.AddCompanionButton_Label': 'Agregar compañero frecuente',

    'AccountProfile.CompanionsForm.ErrorMessage.Gender_Required_Message': 'El género es obligatorio',
    'AccountProfile.CompanionsForm.ErrorMessage.Name_Required_Message': 'El nombre es obligatorio',
    'AccountProfile.CompanionsForm.ErrorMessage.LastName_Required_Message': 'El apellido es obligatorio',
    'AccountProfile.CompanionsForm.ErrorMessage.Day_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.CompanionsForm.ErrorMessage.Month_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.CompanionsForm.ErrorMessage.Year_Required_Message':
      'La fecha de nacimiento está incompleta. Completa todos los campos requeridos.',
    'AccountProfile.CompanionsForm.ErrorMessage.Country_Required_Message': 'El país es obligatorio',
    'AccountProfile.CompanionsForm.ErrorMessage.Name_InvalidPattern_Message': 'Por favor ingresa un carácter válido',
    'AccountProfile.CompanionsForm.ErrorMessage.LastName_InvalidPattern_Message':
      'Por favor ingresa un carácter válido',
    //MONTHS
    'MONTHS.01': 'Enero',
    'MONTHS.02': 'Febrero',
    'MONTHS.03': 'Marzo',
    'MONTHS.04': 'Abril',
    'MONTHS.05': 'Mayo',
    'MONTHS.06': 'Junio',
    'MONTHS.07': 'Julio',
    'MONTHS.08': 'Agosto',
    'MONTHS.09': 'Septiembre',
    'MONTHS.10': 'Octubre',
    'MONTHS.11': 'Noviembre',
    'MONTHS.12': 'Diciembre',

    // ACTIONS
    // 'AccountProfile.AddButton_Label': 'Agregar nuevo',
    'AccountProfile.CancelButton_Label': 'Cancelar',
    'AccountProfile.ConfirmButton_Label': 'Guardar',
    'AccountProfile.EditButton_Label': 'Editar',
  },
  en: {
    //COMMON
    'Common.LabelDay': 'Day',
    'Common.LabelMonth': 'Month',
    'Common.LabelYear': 'Year',
    //ACCOUNT PROFILE
    'AccountProfile.Title': 'My profile',
    'AccountProfile.Loading': 'Loading your profile information...',
    'AccountProfile.Description':
      'Enter your details exactly as they appear on your official ID. This information will be used to create your profile and save your time during check-in.',
    //FORM PERSONAL
    'AccountProfile.PersonalForm.Title': 'Personal information',
    'AccountProfile.PersonalForm.Address_Label': 'Address',
    'AccountProfile.PersonalForm.Birthday_Label': 'Date of birth',
    'AccountProfile.PersonalForm.City_Label': 'City',
    'AccountProfile.PersonalForm.Country_Label': 'Country of residence',
    'AccountProfile.PersonalForm.Gender_Label': 'Gender',
    'AccountProfile.PersonalForm.LastName_Label': 'Last name',
    'AccountProfile.PersonalForm.Name_Label': 'First name',
    'AccountProfile.PersonalForm.CompleteName_Label': 'Complete name',
    'AccountProfile.PersonalForm.Frequent_Traveller_Program_Label': 'Frequent traveller program (optional)',
    'AccountProfile.PersonalForm.Frequent_Traveller_Number_Label': 'Frequent traveller number (optional)',
    'AccountProfile.PersonalForm.AddPersonalInformationButton_Label': 'Add personal information',

    'AccountProfile.PersonalForm.ErrorMessage.Gender_Required_Message': 'Gender is required',
    'AccountProfile.PersonalForm.ErrorMessage.LastName_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.PersonalForm.ErrorMessage.Day_Required_Message': 'Day is required',
    'AccountProfile.PersonalForm.ErrorMessage.Month_Required_Message': 'Month is required',
    'AccountProfile.PersonalForm.ErrorMessage.Year_Required_Message': 'Year is required',
    'AccountProfile.PersonalForm.ErrorMessage.Country_Required_Message': 'Country is required',
    'AccountProfile.PersonalForm.ErrorMessage.City_Required_Message': 'City is required',
    'AccountProfile.PersonalForm.ErrorMessage.City_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.PersonalForm.ErrorMessage.Address_Required_Message': 'Address is required',
    'AccountProfile.PersonalForm.ErrorMessage.Address_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.PersonalForm.ErrorMessage.FirstName_Required_Message': 'First name is required',
    'AccountProfile.PersonalForm.ErrorMessage.LastName_Required_Message': 'Last name is required',
    'AccountProfile.PersonalForm.ErrorMessage.FirstName_InvalidPattern_Message': 'Please enter a valid character',

    //FORM CONTACT
    'AccountProfile.ContactForm.Title': 'Contact information',
    'AccountProfile.ContactForm.Email_Label': 'Email',
    'AccountProfile.ContactForm.Phone_Label': 'Phone',
    'AccountProfile.ContactForm.Prefix_Label': 'Prefix',
    'AccountProfile.ContactForm.PhoneNumber_Label': 'Phone Number',
    'AccountProfile.ContactForm.AddContactInformationButton_Label': 'Add contact information',

    'AccountProfile.ContactForm.ErrorMessage.Phone_Required_Message': 'Phone is required',
    'AccountProfile.ContactForm.ErrorMessage.Phone_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.ContactForm.ErrorMessage.Phone_Minlength_Message': 'Minimum length is 6 characters',
    'AccountProfile.ContactForm.ErrorMessage.Phone_Maxlength_Message': 'Maximum length is 15 characters',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Required_Message': 'Prefix is required',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.ContactForm.ErrorMessage.Email_Required_Message': 'Email is required',
    'AccountProfile.ContactForm.ErrorMessage.Email_InvalidPattern_Message': 'Please enter a valid email',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Minlength_Message': 'Minimum length is 1 character',
    'AccountProfile.ContactForm.ErrorMessage.Prefix_Maxlength_Message': 'Maximum length is 5 characters',

    //FORM EMERGENCY CONTACT
    'AccountProfile.EmergencyForm.Title': 'Emergency contact',
    'AccountProfile.EmergencyForm.CompleteName_Label': 'Name',
    'AccountProfile.EmergencyForm.Phone_Label': 'Phone',
    'AccountProfile.EmergencyForm.PhoneNumber_Label': 'Phone Number',
    'AccountProfile.EmergencyForm.Prefix_Label': 'Prefix',
    'AccountProfile.EmergencyForm.AddEmergencyContactButton_Label': 'Add emergency contact',

    'AccountProfile.EmergencyForm.ErrorMessage.CompleteName_Required_Message': 'Full name is required',
    'AccountProfile.EmergencyForm.ErrorMessage.CompleteName_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Required_Message': 'Phone is required',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Minlength_Message': 'Minimum length is 6 characters',
    'AccountProfile.EmergencyForm.ErrorMessage.Phone_Maxlength_Message': 'Maximum length is 15 characters',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Required_Message': 'Prefix is required',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Minlength_Message': 'Minimum length is 1 characters',
    'AccountProfile.EmergencyForm.ErrorMessage.Prefix_Maxlength_Message': 'Maximum length is 5 characters',

    //FORM TRAVEL DOCUMENTS
    'AccountProfile.DocumentsForm.MainDocument_Title': 'Travel documents',
    'AccountProfile.DocumentsForm.SecondaryDocument_Title': 'Document',
    'AccountProfile.DocumentsForm.Description':
      'You can save up two documents. Once added, the type of document cannot be changed, so be sure to select the correct one.',
    'AccountProfile.DocumentsForm.DocumentType_Label': 'Type of document',
    'AccountProfile.DocumentsForm.DocumentExpirationDate_Title': 'Date of expiration',
    'AccountProfile.DocumentsForm.DocumentNationality_Label': 'Document nationality',
    'AccountProfile.DocumentsForm.DocumentNumber_Label': 'Document number',
    'AccountProfile.DocumentsForm.AddDocumentButton_Label': 'Add travel document',

    'AccountProfile.DocumentsForm.ErrorMessage.DocumentType_Required_Message': 'Type of document is required',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Required_Message': 'Document number is required',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNationality_Required_Message':
      'Document nationality is required',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Pattern_Message': 'Please enter a valid character',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Min_Message': 'Minimum length is 6 characters',
    'AccountProfile.DocumentsForm.ErrorMessage.DocumentNumber_Max_Message': 'Maximum length is 15 characters',
    'AccountProfile.DocumentsForm.ErrorMessage.Day_Required_Message': 'Day is required',
    'AccountProfile.DocumentsForm.ErrorMessage.Month_Required_Message': 'Month is required',
    'AccountProfile.DocumentsForm.ErrorMessage.Year_Required_Message': 'Year is required',

    //FORM COMPANIONS
    'AccountProfile.CompanionsForm.Title': 'Frequent companions',
    'AccountProfile.CompanionsForm.PaxForm_Label': 'Adult',
    'AccountProfile.CompanionsForm.Birthday_Label': 'Birthday',
    'AccountProfile.CompanionsForm.CompleteName_Label': 'Name / Last name',
    'AccountProfile.CompanionsForm.Country_Label': 'Country of residence',
    'AccountProfile.CompanionsForm.Description': 'You can save up to four frequent companions',
    'AccountProfile.CompanionsForm.Gender_Label': 'Gender',
    'AccountProfile.CompanionsForm.LastName_Label': 'Last Name',
    'AccountProfile.CompanionsForm.Lifemiles_Label': 'Lifemiles',
    'AccountProfile.CompanionsForm.Name_Label': 'Name',
    'AccountProfile.CompanionsForm.AddCompanionButton_Label': 'Add frequent companions',

    'AccountProfile.CompanionsForm.ErrorMessage.Gender_Required_Message': 'Gender is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Name_Required_Message': 'First name is required',
    'AccountProfile.CompanionsForm.ErrorMessage.LastName_Required_Message': 'Last name is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Day_Required_Message': 'Day is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Month_Required_Message': 'Month is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Year_Required_Message': 'Year is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Country_Required_Message': 'Country is required',
    'AccountProfile.CompanionsForm.ErrorMessage.Name_InvalidPattern_Message': 'Please enter a valid character',
    'AccountProfile.CompanionsForm.ErrorMessage.LastName_InvalidPattern_Message': 'Please enter a valid character',
    //MONTHS
    'MONTHS.01': 'January',
    'MONTHS.02': 'February',
    'MONTHS.03': 'March',
    'MONTHS.04': 'April',
    'MONTHS.05': 'May',
    'MONTHS.06': 'June',
    'MONTHS.07': 'July',
    'MONTHS.08': 'August',
    'MONTHS.09': 'September',
    'MONTHS.10': 'October',
    'MONTHS.11': 'November',
    'MONTHS.12': 'December',

    // ACTIONS
    // 'AccountProfile.AddButton_Label': 'Add new',
    'AccountProfile.CancelButton_Label': 'Cancel',
    'AccountProfile.ConfirmButton_Label': 'Save',
    'AccountProfile.EditButton_Label': 'Edit',
  },
};

export class FakeTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return of(TRANSLATIONS[lang] || {});
  }
}
