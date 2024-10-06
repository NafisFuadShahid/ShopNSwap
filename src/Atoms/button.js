const MainButton = ({ children, style, ...props }) => {
  return (
    <button className={`btn ${style}`} {...props}>
      {children}
    </button>
  );
};

export default MainButton;
