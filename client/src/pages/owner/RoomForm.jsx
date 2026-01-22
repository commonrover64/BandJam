// import React from "react";
// import {
//   Checkbox,
//   Form,
//   Input,
//   InputNumber,
//   Modal,
//   ConfigProvider,
//   theme,
// } from "antd";

// const RoomForm = ({ open, onclose, onSubmit, initialValues, isEditMode }) => {
//   const [form] = Form.useForm();

//   const handleFinish = (values) => {
//     onSubmit(values);
//   };

//   const equipmentOptions = [
//     { label: "Drum Set", value: "Drums" },
//     { label: "Amplifiers", value: "Amplifiers" },
//     { label: "Microphones", value: "Microphones" },
//   ];

//   return (
//     <ConfigProvider
//       theme={{
//         algorithm: theme.darkAlgorithm,
//         token: {
//           colorPrimary: "#6366f1",
//           colorBgElevated: "#0f172a",
//           colorBorder: "#334155",
//           borderRadius: 12,
//         },
//         components: {
//           Checkbox: {
//             colorPrimary: "#6366f1",
//           },
//         },
//       }}
//     >
//       <Modal
//         open={open}
//         onCancel={onclose}
//         centered
//         footer={null}
//         width={600}
//         styles={{
//           mask: { backdropFilter: "blur(4px)" },
//         }}
//         closeIcon={
//           <span className="text-slate-400 hover:text-white transition-colors text-lg">
//             ×
//           </span>
//         }
//       >
//         <div className="text-center mb-8">
//           <h2 className="text-2xl font-bold text-white tracking-tight">
//             {isEditMode ? "Update Studio Details" : "Register New Room"}
//           </h2>
//         </div>

//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleFinish}
//           // Ensure equipments is always an array so it doesn't crash
//           initialValues={{
//             ...initialValues,
//             equipments: initialValues?.equipments || [],
//           }}
//           requiredMark={false}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//             <Form.Item
//               label={
//                 <span className="text-slate-300 font-medium ml-1">
//                   Room Name
//                 </span>
//               }
//               name="name"
//               rules={[{ required: true, message: "Required" }]}
//             >
//               <Input
//                 className="h-11 !bg-slate-900/50 border-slate-700 text-slate-200"
//                 placeholder="e.g. Studio A"
//               />
//             </Form.Item>

//             <Form.Item
//               label={
//                 <span className="text-slate-300 font-medium ml-1">
//                   Rate (₹ / day)
//                 </span>
//               }
//               name="rate"
//               rules={[{ required: true, message: "Required" }]}
//             >
//               <InputNumber
//                 min={0}
//                 className="w-full h-11 !bg-slate-900/50 border-slate-700 flex items-center"
//                 placeholder="Price"
//               />
//             </Form.Item>
//           </div>

//           <Form.Item
//             label={
//               <span className="text-slate-300 font-medium ml-1">Address</span>
//             }
//             name="address"
//             rules={[{ required: true, message: "Required" }]}
//           >
//             <Input
//               className="h-11 !bg-slate-900/50 border-slate-700 text-slate-200"
//               placeholder="Location"
//             />
//           </Form.Item>

//           <Form.Item
//             label={
//               <span className="text-slate-300 font-medium ml-1">
//                 Contact Phone
//               </span>
//             }
//             name="phone"
//             rules={[
//               { required: true, message: "Required" },
//               { pattern: /^[0-9]{10}$/, message: "Invalid phone" },
//             ]}
//           >
//             <Input
//               maxLength={10}
//               className="h-11 !bg-slate-900/50 border-slate-700 text-slate-200"
//               placeholder="10-digit number"
//             />
//           </Form.Item>

//           <Form.Item
//             label={
//               <span className="text-slate-300 font-medium ml-1">
//                 Available Equipments
//               </span>
//             }
//             name="equipments"
//           >
//             <Checkbox.Group
//               options={equipmentOptions}
//               className="w-full p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 flex gap-6"
//             />
//           </Form.Item>

//           <Form.Item
//             label={
//               <span className="text-slate-300 font-medium ml-1">
//                 Description
//               </span>
//             }
//             name="description"
//             rules={[{ required: true, message: "Required" }]}
//           >
//             <Input.TextArea
//               rows={3}
//               className="!bg-slate-900/50 border-slate-700 text-slate-200"
//               placeholder="Gear details..."
//             />
//           </Form.Item>

//           <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-800">
//             <button
//               type="button"
//               onClick={onclose}
//               className="px-6 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
//             >
//               {isEditMode ? "Save Changes" : "Register Room"}
//             </button>
//           </div>
//         </Form>
//       </Modal>

//       {/* This small block ensures the text inside the Checkbox.Group matches your slate theme */}
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//         .ant-checkbox-group .ant-checkbox-wrapper {
//           color: #94a3b8 !important; /* text-slate-400 */
//           font-weight: 500;
//         }
//         .ant-checkbox-group .ant-checkbox-wrapper:hover {
//           color: #ffffff !important;
//         }
//       `,
//         }}
//       />
//     </ConfigProvider>
//   );
// };

// export default RoomForm;



import React from "react";
import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  ConfigProvider,
  theme,
} from "antd";

const RoomForm = ({ open, onclose, onSubmit, initialValues, isEditMode }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
  };

  const equipmentOptions = [
    { label: "Drum Set", value: "Drums" },
    { label: "Amplifiers", value: "Amplifiers" },
    { label: "Microphones", value: "Microphones" },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#6366f1",
          colorBgElevated: "#2E333B",
          colorBorder: "#334155",
          borderRadius: 12,
        },
      }}
    >
      <Modal
        open={open}
        onCancel={onclose}
        centered
        footer={null}
        width={600}
        className="[&_.ant-modal-content]:!bg-[#2E333B] [&_.ant-modal-content]:!rounded-2xl"
        styles={{ mask: { backdropFilter: "blur(4px)" } }}
        closeIcon={
          <span className="text-slate-400 hover:text-slate-100 transition text-lg">
            ×
          </span>
        }
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            {isEditMode ? "Update Studio Details" : "Register New Room"}
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            ...initialValues,
            equipments: initialValues?.equipments || [],
          }}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item
              label={<span className="text-slate-300">Room Name</span>}
              name="name"
              rules={[{ required: true }]}
            >
              <Input
                className="h-11 !bg-[#262A30] !border-slate-700 !text-slate-100"
                placeholder="Studio A"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-slate-300">Rate (₹ / day)</span>}
              name="rate"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                className="w-full h-11 !bg-[#262A30] !border-slate-700 !text-slate-100"
                placeholder="Price"
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="text-slate-300">Address</span>}
            name="address"
            rules={[{ required: true }]}
          >
            <Input
              className="h-11 !bg-[#262A30] !border-slate-700 !text-slate-100"
              placeholder="Location"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-300">Contact Phone</span>}
            name="phone"
            rules={[
              { required: true },
              { pattern: /^[0-9]{10}$/, message: "Invalid phone" },
            ]}
          >
            <Input
              maxLength={10}
              className="h-11 !bg-[#262A30] !border-slate-700 !text-slate-100"
              placeholder="10-digit number"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-300">Available Equipments</span>}
            name="equipments"
          >
            <Checkbox.Group
              options={equipmentOptions}
              className="w-full p-4 bg-[#262A30] rounded-xl border border-slate-700/60 flex gap-6"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-300">Description</span>}
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              rows={3}
              className="!bg-[#262A30] !border-slate-700 !text-slate-100"
              placeholder="Gear details..."
            />
          </Form.Item>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onclose}
              className="px-5 py-2 text-slate-400 hover:text-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-500/80 to-sky-500/80 text-white font-medium rounded-xl shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition"
            >
              {isEditMode ? "Save Changes" : "Register Room"}
            </button>
          </div>
        </Form>
      </Modal>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .ant-checkbox-wrapper {
              color: #94a3b8 !important;
            }
            .ant-checkbox-wrapper:hover {
              color: #e5e7eb !important;
            }
          `,
        }}
      />
    </ConfigProvider>
  );
};

export default RoomForm;
