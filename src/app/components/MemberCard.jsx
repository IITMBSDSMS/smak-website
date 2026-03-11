export default function MemberCard({ name, role, college, image }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">

      <img
        src={image && image !== "" ? image : "/logo.png"}
        width={130}
        height={130}
        alt={name || "member"}
        className="mx-auto rounded-full mb-6 object-cover border-4 border-white shadow-md"
      />

      <h3 className="font-semibold text-xl text-gray-800">{name}</h3>

      <p className="text-blue-600 font-medium mt-1">{role}</p>

      <p className="text-gray-500 text-sm mt-2">{college}</p>

    </div>
  )
}