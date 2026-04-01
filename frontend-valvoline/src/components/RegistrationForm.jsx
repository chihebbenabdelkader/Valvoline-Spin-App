import React, { useState } from "react";

const RegistrationForm = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    magasin: "",
    ville: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.nom) tempErrors.nom = "الرجاء إدخال الاسم و اللقب";
    if (!formData.telephone) tempErrors.telephone = "الرجاء إدخال رقم الهاتف";
    else if (formData.telephone.length < 8)
      tempErrors.telephone = "رقم الهاتف غير صحيح";
    if (!formData.magasin) tempErrors.magasin = "الرجاء إدخال اسم المحل";
    if (!formData.ville) tempErrors.ville = "الرجاء إدخال الولاية";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const localSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onRegisterSuccess(formData);
      } catch (error) {
        // 👈 صلحناها هوني: طبعنا الـ error في الـ console باش يتنحى الـ Warning
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-t-[40px] p-8 animate-slide-up shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <h2 className="text-[#E11D48] text-2xl font-black text-center mb-8">
          سجل بياناتك للمشاركة
        </h2>

        <form className="space-y-4" dir="rtl" onSubmit={localSubmit}>
          {/* حقل الاسم */}
          <div>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="الاسم و اللقب"
              className={`w-full p-4 bg-gray-100 border-none rounded-2xl text-right outline-none focus:ring-2 ${errors.nom ? "ring-2 ring-red-500" : "focus:ring-red-500"}`}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1 font-bold">
                {errors.nom}
              </p>
            )}
          </div>

          {/* حقل الهاتف */}
          <div>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="رقم الهاتف"
              className={`w-full p-4 bg-gray-100 border-none rounded-2xl text-right outline-none focus:ring-2 ${errors.telephone ? "ring-2 ring-red-500" : "focus:ring-red-500"}`}
            />
            {errors.telephone && (
              <p className="text-red-500 text-sm mt-1 font-bold">
                {errors.telephone}
              </p>
            )}
          </div>

          {/* حقل المحل */}
          <div>
            <input
              type="text"
              name="magasin"
              value={formData.magasin}
              onChange={handleChange}
              placeholder="اسم المحل"
              className={`w-full p-4 bg-gray-100 border-none rounded-2xl text-right outline-none focus:ring-2 ${errors.magasin ? "ring-2 ring-red-500" : "focus:ring-red-500"}`}
            />
            {errors.magasin && (
              <p className="text-red-500 text-sm mt-1 font-bold">
                {errors.magasin}
              </p>
            )}
          </div>

          {/* حقل الولاية */}
          <div>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="الولاية"
              className={`w-full p-4 bg-gray-100 border-none rounded-2xl text-right outline-none focus:ring-2 ${errors.ville ? "ring-2 ring-red-500" : "focus:ring-red-500"}`}
            />
            {errors.ville && (
              <p className="text-red-500 text-sm mt-1 font-bold">
                {errors.ville}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E11D48] text-white text-xl font-bold py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? "جاري التحقق..." : "تأكيد و تدوير العجلة"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
