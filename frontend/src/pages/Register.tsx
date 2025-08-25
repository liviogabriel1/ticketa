import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e:any) => {
    e.preventDefault()
    await api.post('/auth/signup', { name, email, password })
    alert('Conta criada! Faça login.')
    navigate('/login')
  }

  return (
    <div className="container">
      <form onSubmit={submit} className="card max-w-md">
        <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
        <input className="input mb-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input mb-4" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn">Cadastrar</button>
        <p className="mt-4 text-sm">Já tem conta? <Link to="/login" className="underline">Entrar</Link></p>
      </form>
    </div>
  )
}
