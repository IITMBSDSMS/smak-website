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

const searchParams = useSearchParams()
const entryFromURL = searchParams.get("entry")

useEffect(()=>{
if(entryFromURL){
setEntry(entryFromURL)
}
},[entryFromURL])

const generateCard = async ()=>{

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

canvas.width = 1000
canvas.height = 600

ctx.fillStyle="#0B1F3A"
ctx.fillRect(0,0,1000,600)

ctx.fillStyle="white"
ctx.font="bold 40px Arial"
ctx.fillText("SMAK MEMBER ID CARD",260,80)

ctx.font="28px Arial"
ctx.fillText(`Name: ${name}`,350,250)
ctx.fillText(`Entry: ${entry}`,350,300)
ctx.fillText(`Phone: ${phone}`,350,350)

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

<input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
<input placeholder="Phone" onChange={(e)=>setPhone(e.target.value)} />
<input
placeholder="Entry No"
value={entry}
onChange={(e)=>setEntry(e.target.value)}
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