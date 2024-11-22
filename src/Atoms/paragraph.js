const Paragraph = ({ color, fontSize, style, children }) => {
  return (
    <p className={`${color} ${fontSize} ${style}`}>
      {children}
    </p>
  );
};

export default Paragraph;
