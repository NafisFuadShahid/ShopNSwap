import React, {useContext} from 'react'
import {AuthContext} from '../context/auth'
import {Navigate, Outlet} from 'react-router-dom'
const PrivateRoute = () => {
    const {user} = useContext(AuthContext)
    if (!user) {
        return <Navigate to="/auth/login" />
    }
  return <Outlet />
}

export default PrivateRoute