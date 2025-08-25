import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e:any) => {
    e.preventDefault()
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', r.data.token)
    alert('Bem-vindo, ' + r.data.user.name)
    navigate('/')
  }

  return (
    <div className="container">
      <form onSubmit={submit} className="card max-w-md">
        <h1 className="text-2xl font-bold mb-4">Entrar</h1>
        <input className="input mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input mb-4" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn">Entrar</button>
        <p className="mt-4 text-sm">Não tem conta? <Link to="/register" className="underline">Cadastre-se</Link></p>
      </form>
    </div>
  )
}
