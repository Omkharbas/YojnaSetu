import React from "react";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  ShieldCheck,
  FileText,
  Pencil,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "Not provided"}
      </p>
    </div>
  );
}

export default function Profile() {
  const { profile } = useApp();
  const navigate = useNavigate();

  const formatIncome = (income) => {
    if (!income && income !== 0) return "Not provided";

    return `₹${Number(income).toLocaleString("en-IN")}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your citizen information and eligibility details.
          </p>
        </div>

        <button
          onClick={() => navigate("/profile/edit")}
          className="btn-primary"
        >
          <Pencil size={17} />
          Edit Profile
        </button>

      </div>


      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <section className="card mb-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          {/* Avatar */}

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">

            <User size={38} />

          </div>


          {/* Main information */}

          <div className="flex-1">

            <h2 className="text-xl font-bold text-slate-900">
              {profile.name || "Citizen"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.occupation || "Occupation not provided"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {profile.category || "General"}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {profile.state || "State not provided"}
              </span>

            </div>

          </div>


          {/* Edit icon */}

          <button
            onClick={() => navigate("/profile/edit")}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 sm:flex"
            title="Edit Profile"
          >
            <Pencil size={18} />
          </button>

        </div>

      </section>


      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <User size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Basic Information
            </h2>

            <p className="text-xs text-slate-500">
              Your personal details
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Full Name"
            value={profile.name}
          />

          <InfoItem
            label="Age"
            value={profile.age}
          />

          <InfoItem
            label="Gender"
            value={profile.gender}
          />

          <InfoItem
            label="Marital Status"
            value={profile.marital_status}
          />

          <InfoItem
            label="State"
            value={profile.state}
          />

          <InfoItem
            label="District"
            value={profile.district}
          />

        </div>

      </section>


      {/* =====================================================
          ECONOMIC INFORMATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Briefcase size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Economic Information
            </h2>

            <p className="text-xs text-slate-500">
              Income and employment details
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Annual Household Income"
            value={formatIncome(profile.annual_income)}
          />

          <InfoItem
            label="Employment Status"
            value={profile.employment_status}
          />

          <InfoItem
            label="Income Category"
            value={profile.income_category}
          />

          <InfoItem
            label="BPL Status"
            value={profile.bpl_status ? "Yes" : "No"}
          />

          <InfoItem
            label="Occupation"
            value={profile.occupation}
          />

        </div>

      </section>


      {/* =====================================================
          SOCIAL INFORMATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Social Information
            </h2>

            <p className="text-xs text-slate-500">
              Category and special eligibility information
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Social Category"
            value={profile.category}
          />

          <InfoItem
            label="Disability"
            value={
              profile.disability_status
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Minority Status"
            value={
              profile.minority_status
                ? "Yes"
                : "No"
            }
          />

        </div>

      </section>


      {/* =====================================================
          FAMILY INFORMATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Users size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Family Information
            </h2>

            <p className="text-xs text-slate-500">
              Household details
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <InfoItem
            label="Family Members"
            value={profile.family_members}
          />

          <InfoItem
            label="Children"
            value={profile.children}
          />

          <InfoItem
            label="Girl Children"
            value={profile.girl_children}
          />

          <InfoItem
            label="Pregnant / Lactating"
            value={
              profile.pregnant_or_lactating
                ? "Yes"
                : "No"
            }
          />

        </div>

      </section>


      {/* =====================================================
          EDUCATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <GraduationCap size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Education
            </h2>

            <p className="text-xs text-slate-500">
              Education and student information
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <InfoItem
            label="Education Level"
            value={profile.education_level}
          />

          <InfoItem
            label="Student Status"
            value={
              profile.student_status
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Course"
            value={profile.course}
          />

          <InfoItem
            label="Institution Type"
            value={profile.institution_type}
          />

        </div>

      </section>


      {/* =====================================================
          OTHER INFORMATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Other Information
            </h2>

            <p className="text-xs text-slate-500">
              Housing, agriculture and documents
            </p>
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Owns House"
            value={
              profile.owns_house
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Area Type"
            value={
              profile.rural
                ? "Rural"
                : "Urban"
            }
          />

          <InfoItem
            label="Homeless"
            value={
              profile.homeless
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Owns Agricultural Land"
            value={
              profile.owns_land
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Health Insurance"
            value={
              profile.health_insurance
                ? "Yes"
                : "No"
            }
          />

          <InfoItem
            label="Documents Available"
            value={
              profile.documents?.length
                ? `${profile.documents.length} document(s)`
                : "None added"
            }
          />

        </div>

      </section>


      {/* =====================================================
          EDIT PROFILE BUTTON
      ===================================================== */}

      <div className="flex justify-center">

        <button
          onClick={() => navigate("/profile/edit")}
          className="btn-primary px-6 py-3"
        >
          <Pencil size={18} />
          Edit Profile
          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
}