export default function EventCard({ title, location, date }) {

  return (

    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">

      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-500 text-sm">
        {location}
      </p>

      <p className="text-blue-600 font-medium mt-2">
        {date}
      </p>

      <button className="mt-4 text-sm text-white bg-blue-600 px-4 py-2 rounded-lg">
        View Details
      </button>

    </div>

  )

}