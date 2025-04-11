import { TextInput, PasswordInput, Button, Paper, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';

export function LoginForm() {
  const { login } = useAuth();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      password: (value) => (value.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : null),
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
      <Title align="center" order={1}>
        Connexion
      </Title>

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
    </Container>
  );
} 