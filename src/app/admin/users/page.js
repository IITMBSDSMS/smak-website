"use client"

import { useEffect, useState } from "react"

export default function Users(){

  const [users,setUsers] = useState([])

  useEffect(()=>{
    fetch("/api/users")
    .then(res=>res.json())
    .then(data=>setUsers(data))
  },[])

  return(

    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl mb-8">Registered Users</h1>

      <table className="w-full">

        <thead>
          <tr className="text-left border-b border-gray-700">
            <th>Name</th>
            <th>Email</th>
            <th>College</th>
            <th>Year</th>
          </tr>
        </thead>

        <tbody>

          {users.map((u,i)=>(
            <tr key={i} className="border-b border-gray-800">
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.college}</td>
              <td>{u.year}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}