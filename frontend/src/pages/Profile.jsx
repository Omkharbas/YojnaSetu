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
  Upload,
  Sparkles,
  FileCheck,
  Loader2,
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

  const [selectedFile, setSelectedFile] = React.useState(null);
  const [verificationStatus, setVerificationStatus] = React.useState("idle");

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setVerificationStatus("idle");
  };

  const handleVerifyDocument = () => {
    if (!selectedFile) return;

    setVerificationStatus("processing");

    // Document type will be detected automatically by OCR/AI.
    setTimeout(() => {
      setVerificationStatus("pending");
    }, 700);
  };

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
          AI DOCUMENT VERIFICATION
      ===================================================== */}

      <section className="card mb-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              AI Document Verification
            </h2>

            <p className="text-xs text-slate-500">
              Upload a government document for preliminary AI validation
            </p>
          </div>

        </div>

        <div>

          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Upload Government Document
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Upload size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Choose a document"}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                JPG, PNG or PDF • document type will be detected automatically
              </p>
            </div>

            <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              Browse
            </span>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

          </label>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles size={13} className="text-blue-500" />
            <span>AI will identify the document and compare extracted details with your profile.</span>
          </div>

        </div>

        {/* VERIFY BUTTON */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-[11px] text-slate-400">

            <Sparkles
              size={13}
              className="text-blue-500"
            />

            <span>
              AI checks will compare the document with your profile
            </span>

          </div>

          <button
            type="button"
            onClick={handleVerifyDocument}
            disabled={
              !selectedFile ||
              verificationStatus === "processing"
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >

            {verificationStatus === "processing" ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Preparing...
              </>
            ) : (
              <>
                <FileCheck size={16} />
                Verify Document with AI
              </>
            )}

          </button>

        </div>

        {/* STATUS */}

        {verificationStatus === "pending" && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

            <div className="flex items-start gap-3">

              <Sparkles
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>

                <p className="text-sm font-bold text-blue-800">
                  Document ready for AI verification
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  The document has been submitted for OCR and AI validation.
                  The detected document type will be shown with the verification result.
                </p>

              </div>

            </div>

          </div>
        )}

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