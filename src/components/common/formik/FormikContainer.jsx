import React,{useState} from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikControl from './FormikControl';

const FormikContainer = () => {

    const colourOptions = [
        { value: "ocean", label: "Ocean", color: "#00B8D9", isFixed: true },
        { value: "blue", label: "Blue", color: "#0052CC", disabled: true },
        { value: "purple", label: "Purple", color: "#5243AA" },
        { value: "red", label: "Red", color: "#FF5630", isFixed: true },
        { value: "orange", label: "Orange", color: "#FF8B00" },
        { value: "yellow", label: "Yellow", color: "#FFC400" },
        { value: "green", label: "Green", color: "#36B37E" },
        { value: "forest", label: "Forest", color: "#00875A" },
        { value: "slate", label: "Slate", color: "#253858" },
        { value: "silver", label: "Silver", color: "#666666" }
     ];

    const dropdownOptions = [
        { key: 'Select an option', value: '' },
        { key: 'Option 1', value: 'option1' },
        { key: 'Option 2', value: 'option2' },
        { key: 'Option 3', value: 'option3' }
    ];

    const radioOptions = [
        { key: 'Option 1', value: 'roption1' },
        { key: 'Option 2', value: 'roption2' },
        { key: 'Option 3', value: 'roption3' }
    ];

    const checkboxOptions = [
        { key: 'Option 1', value: 'cOption1' },
        { key: 'Option 2', value: 'cOption2' },
        { key: 'Option 3', value: 'cOption3' }
    ];

    const initialValues = {
        email: '',
        description: '',
        selectOption: '',
        radioOption: '',
        checkboxOption: [],
        customSelectOption: ''
    };
    const validationSchema = Yup.object({
        //email: Yup.string().required('Required khare')
        email: Yup.string().email('Invalid email format').required('Required Email !'),
        description: Yup.string().required('Required Desc !'),
        selectOption: Yup.string().required('Required Select !'),
        customSelectOption: Yup.string().required('Required Custom Select !'),
        radioOption: Yup.string().required('Required Radio atleast !'),
        checkboxOption: Yup.array().required('Required CheckBox !')
    });
    const onSubmit = values => console.log('Form Data', values);

    const [formValues, setFormValues] = useState(null);
    console.log('formvalues',formValues);
    return (
        <Formik initialValues={formValues || initialValues} validationSchema={validationSchema} onSubmit={onSubmit  }
            //validateOnChange={true}
        validateOnBlur={true}>
            {
                formik => {
                    console.log('Formik props value', formik.values);
                    return (
                        <Form>
                            <FormikControl control='input' type='email' label='Email' name='email' />
                            <FormikControl control='customSelect' label='Select a Topic' name='customSelectOption' options={colourOptions} placeholder='شماره کانتینر' />
                            <FormikControl control='textarea' type='textarea' label='Descrption' name='description' />
                            <FormikControl control='select' label='Select a Topic' name='selectOption' options={dropdownOptions} />
                            <FormikControl control='radio' label='Radio Topic' name='radioOption' options={radioOptions} />
                            <FormikControl control='checkbox' label='Checkbox Topics' name='checkboxOption' options={checkboxOptions}/>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </Form>);
                }
            }
        </Formik>
    );
}

//function as children: the function automaically receives props
//which we are going to call as formik and this will return the form component

export default FormikContainer;