import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Anchor,
  Center,
  Box,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Email invalide'),
      password: (val) => (val.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values);
      notifications.show({
        title: 'Connexion réussie',
        message: 'Bienvenue sur la plateforme CTF',
        color: 'green',
      });
      navigate('/challenges');
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Identifiants invalides',
        color: 'red',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontFamily: 'Greycliff CF, sans-serif' }}>
        Bienvenue sur CTF Student
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Pas encore de compte ?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/register')}>
          Créer un compte
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="votre@email.com"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth mt="xl" type="submit">
            Se connecter
          </Button>
        </form>
      </Paper>

      <Center mt="xl">
        <Box style={{ maxWidth: rem(400) }} ta="center">
          <Text size="xs" c="dimmed">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
        </Box>
      </Center>
    </Container>
  );
} 