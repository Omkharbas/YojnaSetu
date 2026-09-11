import React, { useState } from "react";
import { ArrowLeft, Save, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getDemoProfile, DOCUMENT_OPTIONS } from "../services/api";


function Field({ label, children }) {
  return (
    <div>
      <label className="label-field">
        {label}
      </label>

      {children}
    </div>
  );
}


export default function EditProfile() {

  const {
    profile,
    setProfile,
  } = useApp();

  const navigate = useNavigate();

  const [loadingDemo, setLoadingDemo] =
    useState(false);


  /* =====================================================
     UPDATE PROFILE
  ===================================================== */

  const update = (key, value) => {

    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));

  };


  /* =====================================================
     DOCUMENT TOGGLE
  ===================================================== */

  const toggleDocument = (doc) => {

    setProfile((previous) => {

      const hasDocument =
        previous.documents.includes(doc);

      return {
        ...previous,

        documents: hasDocument
          ? previous.documents.filter(
              (item) => item !== doc
            )
          : [
              ...previous.documents,
              doc,
            ],
      };

    });

  };


  /* =====================================================
     LOAD DEMO
  ===================================================== */

  const loadDemo = async () => {

    setLoadingDemo(true);

    try {

      const demo =
        await getDemoProfile();

      setProfile(demo);

    } catch (error) {

      alert(
        "Could not reach backend at http://localhost:8000. Make sure the FastAPI server is running."
      );

    } finally {

      setLoadingDemo(false);

    }

  };


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave = (event) => {

    event.preventDefault();

    navigate("/profile");

  };


  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft size={17} />
            Back to Profile
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Edit Profile
          </h1>

          <p className="text-sm text-slate-500">
            Update your information used for scheme eligibility analysis.
          </p>

        </div>


        <button
          onClick={loadDemo}
          disabled={loadingDemo}
          className="btn-secondary"
        >
          <Wand2 size={16} />

          {loadingDemo
            ? "Loading..."
            : "Load Demo Citizen"}

        </button>

      </div>


      <form
        onSubmit={handleSave}
        className="space-y-6"
      >

        {/* =================================================
            PERSONAL
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Personal Information
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Full Name">

              <input
                className="input-field"
                value={profile.name}
                onChange={(e) =>
                  update(
                    "name",
                    e.target.value
                  )
                }
              />

            </Field>


            <Field label="Age">

              <input
                type="number"
                className="input-field"
                value={profile.age}
                onChange={(e) =>
                  update(
                    "age",
                    Number(e.target.value)
                  )
                }
              />

            </Field>


            <Field label="Gender">

              <select
                className="input-field"
                value={profile.gender}
                onChange={(e) =>
                  update(
                    "gender",
                    e.target.value
                  )
                }
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

            </Field>


            <Field label="State">

              <input
                className="input-field"
                value={profile.state}
                onChange={(e) =>
                  update(
                    "state",
                    e.target.value
                  )
                }
              />

            </Field>


            <Field label="District">

              <input
                className="input-field"
                value={profile.district}
                onChange={(e) =>
                  update(
                    "district",
                    e.target.value
                  )
                }
              />

            </Field>


            <Field label="Marital Status">

              <select
                className="input-field"
                value={profile.marital_status}
                onChange={(e) =>
                  update(
                    "marital_status",
                    e.target.value
                  )
                }
              >
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Divorced</option>
              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            ECONOMIC
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Economic Information
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Annual Household Income (₹)">

              <input
                type="number"
                className="input-field"
                value={profile.annual_income}
                onChange={(e) =>
                  update(
                    "annual_income",
                    Number(e.target.value)
                  )
                }
              />

            </Field>


            <Field label="Employment Status">

              <select
                className="input-field"
                value={profile.employment_status}
                onChange={(e) =>
                  update(
                    "employment_status",
                    e.target.value
                  )
                }
              >

                {[
                  "Farmer",
                  "Student",
                  "Salaried",
                  "Self-employed",
                  "Unemployed",
                  "Daily Wage Worker",
                  "Other",
                ].map((option) => (

                  <option
                    key={option}
                  >
                    {option}
                  </option>

                ))}

              </select>

            </Field>


            <Field label="Income Category">

              <select
                className="input-field"
                value={profile.income_category}
                onChange={(e) =>
                  update(
                    "income_category",
                    e.target.value
                  )
                }
              >
                <option>APL</option>
                <option>BPL</option>
                <option>EWS</option>
                <option>LIG</option>
              </select>

            </Field>


            <Field label="BPL Status">

              <select
                className="input-field"
                value={
                  profile.bpl_status
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "bpl_status",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            SOCIAL
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Social Information
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Category">

              <select
                className="input-field"
                value={profile.category}
                onChange={(e) =>
                  update(
                    "category",
                    e.target.value
                  )
                }
              >
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>Other</option>
              </select>

            </Field>


            <Field label="Disability Status">

              <select
                className="input-field"
                value={
                  profile.disability_status
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "disability_status",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>


            <Field label="Minority Status">

              <select
                className="input-field"
                value={
                  profile.minority_status
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "minority_status",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            FAMILY
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Family Information
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Field label="Family Members">

              <input
                type="number"
                className="input-field"
                value={profile.family_members}
                onChange={(e) =>
                  update(
                    "family_members",
                    Number(e.target.value)
                  )
                }
              />

            </Field>


            <Field label="Children">

              <input
                type="number"
                className="input-field"
                value={profile.children}
                onChange={(e) =>
                  update(
                    "children",
                    Number(e.target.value)
                  )
                }
              />

            </Field>


            <Field label="Girl Children">

              <input
                type="number"
                className="input-field"
                value={profile.girl_children}
                onChange={(e) =>
                  update(
                    "girl_children",
                    Number(e.target.value)
                  )
                }
              />

            </Field>


            <Field label="Pregnant / Lactating">

              <select
                className="input-field"
                value={
                  profile.pregnant_or_lactating
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "pregnant_or_lactating",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            EDUCATION
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Education
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Field label="Education Level">

              <input
                className="input-field"
                placeholder="e.g. 10th, Graduate"
                value={profile.education_level}
                onChange={(e) =>
                  update(
                    "education_level",
                    e.target.value
                  )
                }
              />

            </Field>


            <Field label="Student Status">

              <select
                className="input-field"
                value={
                  profile.student_status
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "student_status",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>


            <Field label="Course">

              <input
                className="input-field"
                value={profile.course}
                onChange={(e) =>
                  update(
                    "course",
                    e.target.value
                  )
                }
              />

            </Field>


            <Field label="Institution Type">

              <select
                className="input-field"
                value={profile.institution_type}
                onChange={(e) =>
                  update(
                    "institution_type",
                    e.target.value
                  )
                }
              >

                <option value="">
                  -- Select --
                </option>

                <option>
                  School
                </option>

                <option>
                  College
                </option>

                <option>
                  Professional/Technical
                </option>

              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            OCCUPATION / HOUSING / AGRICULTURE / HEALTH
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Occupation, Housing, Agriculture & Health
          </h2>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Field label="Occupation">

              <select
                className="input-field"
                value={profile.occupation}
                onChange={(e) =>
                  update(
                    "occupation",
                    e.target.value
                  )
                }
              >

                {[
                  "Farmer",
                  "Student",
                  "Salaried",
                  "Self-employed",
                  "Unemployed",
                  "Daily Wage Worker",
                  "Other",
                ].map((option) => (

                  <option
                    key={option}
                  >
                    {option}
                  </option>

                ))}

              </select>

            </Field>


            <Field label="Owns House">

              <select
                className="input-field"
                value={
                  profile.owns_house
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "owns_house",
                    e.target.value === "yes"
                  )
                }
              >

                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>


            <Field label="Area Type">

              <select
                className="input-field"
                value={
                  profile.rural
                    ? "rural"
                    : "urban"
                }
                onChange={(e) =>
                  update(
                    "rural",
                    e.target.value === "rural"
                  )
                }
              >

                <option value="rural">
                  Rural
                </option>

                <option value="urban">
                  Urban
                </option>

              </select>

            </Field>


            <Field label="Homeless">

              <select
                className="input-field"
                value={
                  profile.homeless
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "homeless",
                    e.target.value === "yes"
                  )
                }
              >

                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>


            <Field label="Owns Agricultural Land">

              <select
                className="input-field"
                value={
                  profile.owns_land
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "owns_land",
                    e.target.value === "yes"
                  )
                }
              >

                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>


            <Field label="Has Health Insurance">

              <select
                className="input-field"
                value={
                  profile.health_insurance
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  update(
                    "health_insurance",
                    e.target.value === "yes"
                  )
                }
              >

                <option value="no">
                  No
                </option>

                <option value="yes">
                  Yes
                </option>

              </select>

            </Field>

          </div>

        </section>


        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <section className="card">

          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-700">
            Documents Currently Available
          </h2>


          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            {DOCUMENT_OPTIONS.map((doc) => (

              <label
                key={doc}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >

                <input
                  type="checkbox"
                  checked={profile.documents.includes(doc)}
                  onChange={() =>
                    toggleDocument(doc)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />

                {doc}

              </label>

            ))}

          </div>

        </section>


        {/* =================================================
            SAVE / CANCEL
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="btn-secondary px-6 py-3"
          >
            Cancel
          </button>


          <button
            type="submit"
            className="btn-primary px-6 py-3"
          >

            <Save size={18} />

            Save Changes

          </button>

        </div>

      </form>

    </div>
  );
}