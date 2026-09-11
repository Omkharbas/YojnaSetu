import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  ShieldCheck,
  Home,
  User,
  Search,
  LayoutDashboard,
  ClipboardList,
  LogIn,
  LogOut,
  UserPlus,
  CheckCircle,
} from "lucide-react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


/* =========================================================
   NAVIGATION LINKS
========================================================= */

const links = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    protected: false,
  },
  {
    to: "/profile",
    label: "Citizen Profile",
    icon: User,
    protected: true,
  },
  {
    to: "/schemes",
    label: "Scheme Explorer",
    icon: Search,
    protected: false,
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    protected: true,
  },
  {
    to: "/planner",
    label: "Application Planner",
    icon: ClipboardList,
    protected: true,
  },
];


/* =========================================================
   NAVBAR COMPONENT
========================================================= */

export default function Navbar() {

  const [open, setOpen] = useState(false);

  const {
    isAuthenticated,
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();


  /* =======================================================
     ONLY SHOW PROTECTED LINKS WHEN LOGGED IN
  ======================================================= */

  const visibleLinks = links.filter(
    (link) => !link.protected || isAuthenticated
  );


  /* =======================================================
     CLOSE SIDEBAR WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);


  /* =======================================================
     ESCAPE KEY + DISABLE BACKGROUND SCROLL
  ======================================================= */

  useEffect(() => {

    if (!open) return;

    const handleKeyDown = (event) => {

      if (event.key === "Escape") {
        setOpen(false);
      }

    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";


    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

    };

  }, [open]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {

    setOpen(false);

    logout();

    navigate("/");

  };


  /* =======================================================
     RETURN UI
  ======================================================= */

  return (
    <>
      {/* ===================================================
          TOP NAVBAR
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="flex items-center">

            {/* HAMBURGER BUTTON */}

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-brand-600"
            >
              <Menu size={23} />
            </button>


            {/* LOGO */}

            <Link
              to="/"
              className="flex items-center gap-2"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">

                <ShieldCheck size={20} />

              </div>


              <div className="leading-tight">

                <p className="text-sm font-bold text-slate-900">
                  CivicBenefit AI
                </p>

                <p className="text-[11px] text-slate-400">
                  Scheme Eligibility & Benefits Optimizer
                </p>

              </div>

            </Link>

          </div>


          {/* =================================================
              RIGHT SIDE - PROFILE ICON
          ================================================= */}

          <div>

            {isAuthenticated ? (

              <Link
                to="/profile"
                aria-label="Open profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
              >

                <User size={21} />

              </Link>

            ) : (

              <Link
                to="/login"
                aria-label="Login"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
              >

                <User size={21} />

              </Link>

            )}

          </div>

        </div>

      </header>


      {/* ===================================================
          DARK BACKGROUND OVERLAY
      =================================================== */}

      {open && (

        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

      )}


      {/* ===================================================
          LEFT SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-80
          max-w-[85vw]
          flex-col
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          {/* LOGO */}

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">

              <ShieldCheck size={20} />

            </div>


            <div className="leading-tight">

              <p className="text-sm font-bold text-slate-900">
                CivicBenefit AI
              </p>

              <p className="text-[11px] text-slate-400">
                Benefits Optimizer
              </p>

            </div>

          </Link>


          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >

            <X size={22} />

          </button>

        </div>


        {/* =================================================
            NAVIGATION AREA
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>


          <div className="space-y-1">

            {visibleLinks.map((link) => {

              const Icon = link.icon;

              return (

                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}

                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition

                    ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                    `
                  }
                >

                  <Icon size={19} />

                  <span>
                    {link.label}
                  </span>

                </NavLink>

              );

            })}

          </div>


          {/* =================================================
              CHECK ELIGIBILITY BUTTON
          ================================================= */}

          {isAuthenticated && (

            <div className="mt-6 border-t border-slate-100 pt-5">

              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >

                <CheckCircle size={18} />

                Check My Eligibility

              </NavLink>

            </div>

          )}

        </nav>


        {/* =================================================
            BOTTOM USER SECTION
        ================================================= */}

        <div className="border-t border-slate-100 bg-slate-50 p-4">


          {/* =================================================
              LOGGED IN
          ================================================= */}

          {isAuthenticated ? (

            <>

              {/* USER INFORMATION */}

              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">

                  <User size={19} />

                </div>


                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-900">

                    {user?.name || "Citizen"}

                  </p>


                  <p className="truncate text-xs text-slate-500">

                    {user?.email || ""}

                  </p>

                </div>

              </div>


              {/* LOGOUT BUTTON */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >

                <LogOut size={19} />

                Logout

              </button>

            </>

          ) : (

            /* =================================================
               NOT LOGGED IN
            ================================================= */

            <div className="space-y-2">

              {/* LOGIN */}

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >

                <LogIn size={18} />

                Login

              </Link>


              {/* SIGN UP */}

              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >

                <UserPlus size={18} />

                Create Account

              </Link>

            </div>

          )}

        </div>

      </aside>

    </>
  );
}