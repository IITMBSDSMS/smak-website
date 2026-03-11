"use client"

import QRCode from "qrcode.react"

export default function SmakIDCard({ member }) {

  const verifyUrl = `https://smakresearch.com/member/${member.entry_no}`

  return (

    <div
      id="id-card"
      style={{
        width: "1000px",
        height: "600px",
        background: "#0b2a4a",
        color: "white",
        padding: "40px",
        display: "flex",
        justifyContent: "space-between",
        borderRadius: "12px"
      }}
    >

      <div>

        <h1 style={{fontSize:"28px",marginBottom:"20px"}}>
          SMAK MEMBER ID CARD
        </h1>

        <p><b>Name:</b> {member.name}</p>
        <p><b>Entry No:</b> {member.entry_no}</p>
        <p><b>Phone:</b> {member.phone}</p>

      </div>

      <div style={{textAlign:"center"}}>

        <img
          src={member.photo}
          style={{
            width:"140px",
            height:"160px",
            objectFit:"cover",
            borderRadius:"8px",
            border:"4px solid white"
          }}
        />

        <div style={{marginTop:"15px"}}>

          <QRCode
            value={verifyUrl}
            size={110}
          />

        </div>

      </div>

    </div>
  )
}