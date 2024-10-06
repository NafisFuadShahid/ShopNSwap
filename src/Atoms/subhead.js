const SubHead = ({ color, style, children }) => {
  return (
    <h2 className={`${color} ${style}`}>
      {children}
    </h2>
  );
};

export default SubHead;
