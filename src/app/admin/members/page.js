"use client"

import { useEffect,useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function AdminMembers(){

const [members,setMembers] = useState([])
const [search,setSearch] = useState("")
const [total,setTotal] = useState(0)

useEffect(()=>{

loadMembers()

},[])

const loadMembers = async () => {

const { data } = await supabase
.from("members")
.select("*")
.order("id",{ascending:false})

setMembers(data)
setTotal(data.length)

}

const deleteMember = async (id)=>{

await supabase
.from("members")
.delete()
.eq("id",id)

loadMembers()

}

const filtered = members.filter(m =>
m.name?.toLowerCase().includes(search.toLowerCase())
)

return(

<div className="p-10">

<h1 className="text-3xl font-bold mb-6">
SMAK Admin Dashboard
</h1>

<div className="mb-6">
Total Members: {total}
</div>

<input
placeholder="Search members..."
className="border p-2 mb-4"
onChange={(e)=>setSearch(e.target.value)}
/>

<table className="border w-full">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Entry No</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{filtered.map((m)=>(
<tr key={m.id}>

<td>{m.name}</td>
<td>{m.email}</td>
<td>{m.phone}</td>
<td>{m.entry_no}</td>

<td className="flex gap-2">

<a
href={`/member/${m.entry_no}`}
className="bg-blue-500 text-white px-2 py-1"
>
Verify
</a>

<a
href={`/generate-id?entry=${m.entry_no}`}
className="bg-green-500 text-white px-2 py-1"
>
ID Card
</a>

<button
onClick={()=>deleteMember(m.id)}
className="bg-red-500 text-white px-2 py-1"
>
Delete
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>

)

}