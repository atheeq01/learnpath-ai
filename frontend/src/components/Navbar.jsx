import {Link} from "react-router";

export default function Navbar(){
    return(
         <nav className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600"
        >
          LearnPath AI
        </Link>

        <Link
          to="/courses"
          className="text-slate-700 hover:text-indigo-600"
        >
          Explore Courses
        </Link>
      </div>
    </nav>
    );
}