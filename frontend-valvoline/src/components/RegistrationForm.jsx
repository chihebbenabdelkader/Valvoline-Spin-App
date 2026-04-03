import React, { useState, useEffect, useRef } from "react";

const RegistrationForm = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    magasin: "",
    ville: "",
  });
  // قائمة الولايات
  const WILAYET = [
    "تونس",
    "أريانة",
    "بن عروس",
    "منوبة",
    "نابل",
    "زغوان",
    "بنزرت",
    "باجة",
    "جندوبة",
    "الكاف",
    "سليانة",
    "سوسة",
    "المنستير",
    "المهدية",
    "صفاقس",
    "القيروان",
    "القصرين",
    "سيدي بوزيد",
    "قابس",
    "مدنين",
    "تطاوين",
    "قفصة",
    "توزر",
    "قبلي",
  ];

  // داخل الكومبوننت زد هذين الـ state:
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // زد هذا الـ useEffect باش يسكر لما تنقر برا:
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  const [socialCheck, setSocialCheck] = useState({
    facebook: false,
    instagram: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  // ✅ Fix: --vh يتحدث مع الكيبورد
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  // ✅ Fix: منع scroll الـ body لما الـ modal مفتوح
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const validate = () => {
    let tempErrors = {};
    if (!formData.nom) tempErrors.nom = "الرجاء إدخال الاسم و اللقب";
    if (!formData.telephone) tempErrors.telephone = "الرجاء إدخال رقم الهاتف";
    else if (formData.telephone.length < 8)
      tempErrors.telephone = "رقم الهاتف غير صحيح";
    if (!formData.magasin) tempErrors.magasin = "الرجاء إدخال اسم المحل";
    if (!formData.ville) tempErrors.ville = "الرجاء إدخال الولاية";
    if (!socialCheck.facebook || !socialCheck.instagram) {
      tempErrors.social = "الرجاء متابعتنا على فيسبوك وإنستغرام للمشاركة";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSocialClick = (platform, webUrl) => {
    setSocialCheck((prev) => ({ ...prev, [platform]: true }));
    if (errors.social) setErrors({ ...errors, social: "" });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      let appUrl =
        platform === "facebook"
          ? `fb://facewebmodal/f?href=${webUrl}`
          : `instagram://user?username=afrilubtunisie`;

      const start = Date.now();
      window.location.href = appUrl;

      setTimeout(() => {
        if (Date.now() - start < 2000) {
          window.open(webUrl, "_blank");
        }
      }, 1500);
    } else {
      window.open(webUrl, "_blank");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // ✅ Fix: scroll للـ input لما يتفوكس (مع delay باش الكيبورد يطلع أول)
  const handleFocus = (e) => {
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const localSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onRegisterSuccess(formData);
      } catch (error) {
        console.error("Erreur d'inscription:", error);
        setErrors({
          ...errors,
          telephone: "شاركت معانا قبل، خلي فرصة لغيرك! 😉",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-lg rounded-t-[40px] p-6 md:p-8 animate-slide-up shadow-2xl overflow-y-auto overscroll-contain pb-10"
        // ✅ Fix الرئيسي: استخدام --vh بدل vh الثابت
        style={{ maxHeight: "calc(var(--vh, 1vh) * 92)" }}
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <h2 className="text-[#E11D48] text-2xl font-black text-center mb-6">
          سجل بياناتك للمشاركة
        </h2>

        <form className="space-y-4" dir="rtl" onSubmit={localSubmit}>
          {/* الاسم */}
          <div>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="الاسم و اللقب"
              className={`w-full p-4 bg-gray-100 rounded-2xl text-right outline-none text-[16px] transition-all ${
                errors.nom
                  ? "ring-2 ring-red-500 bg-red-50"
                  : "focus:ring-2 focus:ring-red-500"
              }`}
            />
            {errors.nom && (
              <p className="text-red-500 text-xs mt-1 pr-2 font-bold">
                {errors.nom}
              </p>
            )}
          </div>

          {/* الهاتف */}
          <div>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="رقم الهاتف"
              className={`w-full p-4 bg-gray-100 rounded-2xl text-right outline-none text-[16px] transition-all ${
                errors.telephone
                  ? "ring-2 ring-red-500 bg-red-50"
                  : "focus:ring-2 focus:ring-red-500"
              }`}
            />
            {errors.telephone && (
              <p className="text-red-500 text-xs mt-1 pr-2 font-bold animate-bounce-short">
                {errors.telephone}
              </p>
            )}
          </div>

          {/* المحل */}
          <div>
            <input
              type="text"
              name="magasin"
              value={formData.magasin}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="اسم المحل"
              className={`w-full p-4 bg-gray-100 rounded-2xl text-right outline-none text-[16px] transition-all ${
                errors.magasin
                  ? "ring-2 ring-red-500"
                  : "focus:ring-2 focus:ring-red-500"
              }`}
            />
            {errors.magasin && (
              <p className="text-red-500 text-xs mt-1 pr-2 font-bold">
                {errors.magasin}
              </p>
            )}
          </div>

          {/* الولاية */}
          {/* الولاية - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full p-4 bg-gray-100 rounded-2xl text-right outline-none text-[16px] transition-all flex items-center justify-between ${
                errors.ville
                  ? "ring-2 ring-red-500 bg-red-50"
                  : dropdownOpen
                    ? "ring-2 ring-red-500"
                    : ""
              }`}
            >
              <span
                className={
                  formData.ville ? "text-black font-bold" : "text-gray-400"
                }
              >
                {formData.ville || "الولاية"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* القائمة */}
            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="max-h-52 overflow-y-auto overscroll-contain">
                  {WILAYET.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, ville: w });
                        setDropdownOpen(false);
                        if (errors.ville) setErrors({ ...errors, ville: "" });
                      }}
                      className={`w-full text-right px-5 py-3 text-[15px] transition-all active:scale-95 ${
                        formData.ville === w
                          ? "bg-red-50 text-[#E11D48] font-black"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.ville && (
              <p className="text-red-500 text-xs mt-1 pr-2 font-bold">
                {errors.ville}
              </p>
            )}
          </div>

          {/* Social */}
          <div className="bg-gray-50 p-4 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-center text-sm font-bold mb-3 text-gray-600">
              تابعنا لتفعيل العجلة 👇
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSocialClick(
                    "facebook",
                    "https://www.facebook.com/Afrique.Lubrifiant/",
                  )
                }
                className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                  socialCheck.facebook
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-[#1877f2] text-white"
                }`}
              >
                <i
                  className={`pi ${
                    socialCheck.facebook ? "pi-check-circle" : "pi-facebook"
                  }`}
                ></i>
                <span className="text-xs font-bold">
                  {socialCheck.facebook ? "تمت المتابعة" : "فيسبوك"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSocialClick(
                    "instagram",
                    "https://www.instagram.com/afrilubtunisie/",
                  )
                }
                className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                  socialCheck.instagram
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white"
                }`}
              >
                <i
                  className={`pi ${
                    socialCheck.instagram ? "pi-check-circle" : "pi-instagram"
                  }`}
                ></i>
                <span className="text-xs font-bold">
                  {socialCheck.instagram ? "تمت المتابعة" : "إنستغرام"}
                </span>
              </button>
            </div>

            {errors.social && (
              <p className="text-red-500 text-center text-xs mt-3 font-bold">
                {errors.social}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E11D48] text-white text-xl font-bold py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? "جاري التحقق..." : "تأكيد و تدوير العجلة"}
          </button>
        </form>
      </div>
    </div>
  );
};;

export default RegistrationForm;
