import { Link as RNLink, LinkProps as RNLinkProps } from 'expo-router';

import { Button, ButtonProps } from './Button';

type LinkProps = RNLinkProps & ButtonProps;

const Link = ({ title, ...props }: LinkProps) => {
  return (
    <RNLink {...props} asChild>
      <Button title={title} />
    </RNLink>
  );
};

export default Link;
