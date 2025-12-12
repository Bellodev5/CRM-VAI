export const Input = (props: any) => (
  <input
    {...props}
    className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400 ${
      props.className || ""
    }`}
  />
);