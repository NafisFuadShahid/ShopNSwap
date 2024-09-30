import React, {useState} from 'react'

const Register = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    loading: false
  })

  const{name , email, password, confirmPassword, error, loading} = values;

  const handleChange = e => setValues({...values, [e.target.name]: e.target.value })

  return (
    <form className='shadow rounded p-3 mt-5 form'>
      <h3 className='text-center mb-3'> Create An Account</h3>
      <div className='mb-3'>
        <label htmlFor='name' className='form-label'>
          Name
        </label>
        <input type='text' className='form-control' name='name' value = {name} onChange={handleChange}/>
      </div>
      <div className='mb-3'>
        <label htmlFor='email' className='form-label'>
          Email
        </label>
        <input type='text' className='form-control' name='email' value = {email} onChange={handleChange}/>
      </div>
      <div className='mb-3'>
        <label htmlFor='password' className='form-label'>
          Password
        </label>
        <input type='text' className='form-control' name='password' value = {password} onChange={handleChange}/>
      </div>
      <div className='mb-3'>
        <label htmlFor='confirmPassword' className='form-label'>
          Confirm Password
        </label>
        <input type='text' className='form-control' name='confirmPassword' value = {confirmPassword} onChange={handleChange}/>
      </div>
      <div className='text-center mb-3'>
        <button className='btn btn-secondary btn-sm'>Register</button>
      </div>
    </form>
  );
}

export default Register
