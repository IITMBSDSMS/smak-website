"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import QRCode from "qrcode"
import jsPDF from "jspdf"
import { supabase } from "../../lib/supabase"

function GenerateIDComponent(){

const [name,setName] = useState("")
const [phone,setPhone] = useState("")
const [entry,setEntry] = useState("")
const [photo,setPhoto] = useState(null)
const [loading,setLoading] = useState(false)

const searchParams = useSearchParams()
const entryFromURL = searchParams.get("entry")

useEffect(()=>{
if(entryFromURL){
setEntry(entryFromURL)
}
},[entryFromURL])

useEffect(()=>{
if(!entry) return

const loadMember = async () => {
setLoading(true)

const { data } = await supabase
.from("members")
.select("name, phone")
.eq("entry_no", entry)
.single()

if(data){
setName(data.name || "")
setPhone(data.phone || "")
}

setLoading(false)
}

loadMember()

},[entry])

const generateCard = async ()=>{

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

canvas.width = 1000
canvas.height = 600

// Logo
const logo = new Image()
logo.src = "/smak-logo.png"
logo.onload = ()=>{
ctx.drawImage(logo,40,30,80,80)
}

// Header
ctx.fillStyle = "white"
ctx.font = "bold 42px Arial"
ctx.fillText("SMAK MEMBER ID CARD",200,80)

// Photo frame
ctx.strokeStyle = "white"
ctx.lineWidth = 4
ctx.strokeRect(70,200,220,240)

// Member info
ctx.font = "30px Arial"
ctx.fillText(`Name: ${name}`,340,260)
ctx.fillText(`Member ID: ${entry}`,340,320)
ctx.fillText(`Phone: ${phone}`,340,380)

// Footer
ctx.font = "20px Arial"
ctx.fillText("Society for Medical Academia & Knowledge",250,520)
ctx.fillText("Verify: smakresearch.com",360,550)

if(photo){

const img = new Image()
img.src = URL.createObjectURL(photo)

img.onload = ()=>{

ctx.drawImage(img,80,200,200,200)

QRCode.toCanvas(
`https://smakresearch.com/member/${entry}`,
(error,qr)=>{

ctx.drawImage(qr,760,380,150,150)

downloadPNG(canvas)
downloadPDF(canvas)
uploadToSupabase(canvas)

})

}

}else{

QRCode.toCanvas(
`https://smakresearch.com/member/${entry}`,
(error,qr)=>{

ctx.drawImage(qr,760,380,150,150)

downloadPNG(canvas)
downloadPDF(canvas)
uploadToSupabase(canvas)

})

}

}

const downloadPNG = (canvas)=>{

const link = document.createElement("a")
link.download="smak-id-card.png"
link.href=canvas.toDataURL()
link.click()

}

const downloadPDF = (canvas)=>{

const imgData = canvas.toDataURL("image/png")

const pdf = new jsPDF("landscape","px",[1000,600])

pdf.addImage(imgData,"PNG",0,0,1000,600)

pdf.save("smak-id-card.pdf")

}

const uploadToSupabase = async (canvas)=>{

const blob = await new Promise(resolve =>
canvas.toBlob(resolve,"image/png")
)

const fileName = `${entry}.png`

const { error } = await supabase
.storage
.from("id-cards")
.upload(fileName, blob, {
contentType:"image/png",
upsert:true
})

if(!error){
console.log("ID card uploaded to Supabase")
}

}

return(

<div className="min-h-screen flex flex-col items-center justify-center gap-4">

<h1 className="text-3xl font-bold">
Generate SMAK ID Card
</h1>

<input
placeholder="Name"
value={name}
disabled
className="border px-2 py-1"
/>
<input
placeholder="Phone"
value={phone}
disabled
className="border px-2 py-1"
/>
<input
placeholder="Entry No"
value={entry}
onChange={(e)=>setEntry(e.target.value)}
className="border px-2 py-1"
/>
<input type="file" onChange={(e)=>setPhoto(e.target.files[0])}/>

<button
onClick={generateCard}
className="bg-blue-500 text-white px-4 py-2"
>
Generate ID
</button>

</div>

)

}

export default function GenerateID(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateIDComponent />
    </Suspense>
  )
}