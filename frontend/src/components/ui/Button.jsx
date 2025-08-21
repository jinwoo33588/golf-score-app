import './Button.css';

/** props: variant=default|primary|danger|ghost, size=md|sm */
export default function Button({ children, variant='default', size='md', className='', ...rest }){
  const cls = `btn btn--${variant} btn--${size} ${className}`;
  return <button className={cls} {...rest}>{children}</button>;
}
