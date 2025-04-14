import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, LoadingOverlay, Avatar, Badge, ActionIcon, Text, Container, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBell, faUser, faLock, faLockOpen, faUserMinus, faSignature, faUserTie } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  score: number;
  avatar: string | null;
  createdAt: string;
  isBlocked?: boolean;
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      // Utiliser directement axios sans cache
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`);
      setUsers(response.data.users);
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger la liste des utilisateurs',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetUsername = async (userId: string) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/reset-username`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, username: response.data.user.username } : user
      ));
      notifications.show({
        title: 'Succès',
        message: 'Pseudo réinitialisé avec succès',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de réinitialiser le pseudo',
        color: 'red'
      });
    }
  };

  const handleResetScore = async (userId: string) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/reset-score`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, score: response.data.user.score } : user
      ));
      notifications.show({
        title: 'Succès',
        message: 'Score réinitialisé avec succès',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de réinitialiser le score',
        color: 'red'
      });
    }
  };

  const handleResetAvatar = async (userId: string) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/reset-avatar`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, avatar: response.data.user.avatar } : user
      ));
      notifications.show({
        title: 'Succès',
        message: 'Avatar réinitialisé avec succès',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de réinitialiser l\'avatar',
        color: 'red'
      });
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUserId || !notificationMessage.trim()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/users/${selectedUserId}/notify`, {
        message: notificationMessage
      });
      notifications.show({
        title: 'Succès',
        message: 'Notification envoyée avec succès',
        color: 'green'
      });
      setNotifyModalOpen(false);
      setNotificationMessage('');
      setSelectedUserId(null);
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible d\'envoyer la notification',
        color: 'red'
      });
    }
  };

  const handleToggleBlock = async (userId: string, currentBlockState: boolean) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/toggle-block`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: response.data.user.isBlocked } : user
      ));
      notifications.show({
        title: 'Succès',
        message: `Compte ${currentBlockState ? 'débloqué' : 'bloqué'} avec succès`,
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de modifier l\'état du compte',
        color: 'red'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || confirmUsername !== userToDelete.username) {
      notifications.show({
        title: 'Erreur',
        message: 'Le nom d\'utilisateur ne correspond pas',
        color: 'red'
      });
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userToDelete.id}/delete`, {
        data: { username: confirmUsername }
      });
      
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      notifications.show({
        title: 'Succès',
        message: 'Utilisateur supprimé avec succès',
        color: 'green'
      });
      
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setConfirmUsername('');
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur',
        color: 'red'
      });
    }
  };

  const handleRowClick = (user: User, event: React.MouseEvent) => {
    // Vérifie si le clic provient d'un bouton d'action
    if ((event.target as HTMLElement).closest('.action-buttons')) {
      return;
    }
    setSelectedUser(user);
    setProfileModalOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Container size="xl">
      <div className="space-y-4">
        <TextInput
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:focus': {
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }
            }
          }}
          leftSection={<FontAwesomeIcon icon={faUser} />}
        />
        <Table striped highlightOnHover className="mx-auto">
          <thead>
            <tr>
              <th className="text-white text-center w-[250px]">Utilisateur</th>
              <th className="text-white text-center">Email</th>
              <th className="text-white text-center">Rôle</th>
              <th className="text-white text-center">Score</th>
              <th className="text-white text-center">Statut</th>
              <th className="text-white text-center">Actions principales</th>
              <th className="text-white text-center">Actions de modération</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr 
                key={user.id} 
                onClick={(e) => handleRowClick(user, e)}
                className="cursor-pointer transition-all duration-200 hover:bg-blue-900/30 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <td className="w-[250px]">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-8 h-8 flex-shrink-0">
                      <Avatar src={user.avatar} radius="xl" size="sm">
                        <FontAwesomeIcon icon={faUser} />
                      </Avatar>
                    </div>
                    <Text className="text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {user.username}
                    </Text>
                  </div>
                </td>
                <td className="text-white text-center">{user.email}</td>
                <td className="text-center">
                  <Badge 
                    color={user.role === 'ADMIN' ? 'red' : 'blue'}
                    variant="filled"
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="text-white text-center">{user.score}</td>
                <td className="text-center">
                  <Badge 
                    color={user.isBlocked ? 'red' : 'green'}
                    variant="filled"
                  >
                    {user.isBlocked ? 'Bloqué' : 'Actif'}
                  </Badge>
                </td>
                <td>
                  <div className="flex justify-center gap-2">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetUsername(user.id);
                      }}
                      title="Réinitialiser le pseudo"
                    >
                      <FontAwesomeIcon icon={faSignature} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="yellow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetAvatar(user.id);
                      }}
                      title="Réinitialiser l'avatar"
                    >
                      <FontAwesomeIcon icon={faUserTie} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="teal"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUserId(user.id);
                        setNotifyModalOpen(true);
                      }}
                      title="Envoyer une notification"
                    >
                      <FontAwesomeIcon icon={faBell} />
                    </ActionIcon>
                  </div>
                </td>
                <td>
                  <div className="flex justify-center gap-2">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetScore(user.id);
                      }}
                      title="Réinitialiser le score"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color={user.isBlocked ? 'green' : 'red'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlock(user.id, !!user.isBlocked);
                      }}
                      title={user.isBlocked ? 'Débloquer le compte' : 'Bloquer le compte'}
                    >
                      <FontAwesomeIcon icon={user.isBlocked ? faLockOpen : faLock} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserToDelete(user);
                        setDeleteModalOpen(true);
                      }}
                      title="Supprimer le compte"
                    >
                      <FontAwesomeIcon icon={faUserMinus} />
                    </ActionIcon>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal
          opened={notifyModalOpen}
          onClose={() => {
            setNotifyModalOpen(false);
            setNotificationMessage('');
            setSelectedUserId(null);
          }}
          title="Envoyer une notification"
          size="md"
          styles={{
            header: { backgroundColor: '#1A1B1E', color: 'white' },
            content: { backgroundColor: '#1A1B1E' },
            body: { color: 'white' },
            close: { color: 'white' }
          }}
        >
          <div className="space-y-4">
            <TextInput
              label="Message"
              placeholder="Entrez votre message..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              minLength={1}
              maxLength={255}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:focus': {
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }
                },
                label: { color: 'white' }
              }}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSendNotification}
                disabled={!notificationMessage.trim()}
              >
                Envoyer
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUserToDelete(null);
            setConfirmUsername('');
          }}
          title="Supprimer un utilisateur"
          size="md"
          styles={{
            header: { backgroundColor: '#1A1B1E', color: 'white' },
            content: { backgroundColor: '#1A1B1E' },
            body: { color: 'white' },
            close: { color: 'white' }
          }}
        >
          <div className="space-y-4">
            <Text className="text-red-500">
              Attention ! Cette action est irréversible. Pour confirmer la suppression du compte de {userToDelete?.username}, 
              veuillez saisir son nom d'utilisateur ci-dessous.
            </Text>
            <TextInput
              label="Nom d'utilisateur"
              placeholder="Entrez le nom d'utilisateur..."
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:focus': {
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }
                },
                label: { color: 'white' }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                  setConfirmUsername('');
                }}
              >
                Annuler
              </Button>
              <Button
                color="red"
                onClick={handleDeleteUser}
                disabled={!confirmUsername || confirmUsername !== userToDelete?.username}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          opened={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedUser(null);
          }}
          title="Profil de l'utilisateur"
          size="lg"
          styles={{
            header: { backgroundColor: '#1A1B1E', color: 'white' },
            content: { backgroundColor: '#1A1B1E' },
            body: { color: 'white' },
            close: { color: 'white' }
          }}
        >
          {selectedUser && (
            <Stack>
              <Group justify="center">
                <Avatar 
                  src={selectedUser.avatar} 
                  size="xl" 
                  radius="xl"
                >
                  <FontAwesomeIcon icon={faUser} size="2x" />
                </Avatar>
              </Group>
              
              <Group grow>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Nom d'utilisateur</Text>
                  <Text>{selectedUser.username}</Text>
                </div>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Email</Text>
                  <Text>{selectedUser.email}</Text>
                </div>
              </Group>

              <Group grow>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Rôle</Text>
                  <Badge color={selectedUser.role === 'ADMIN' ? 'red' : 'blue'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Score</Text>
                  <Text>{selectedUser.score} points</Text>
                </div>
              </Group>

              <Group grow>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Statut</Text>
                  <Badge color={selectedUser.isBlocked ? 'red' : 'green'}>
                    {selectedUser.isBlocked ? 'Bloqué' : 'Actif'}
                  </Badge>
                </div>
                <div>
                  <Text c="dimmed" size="sm" fw={500}>Date d'inscription</Text>
                  <Text>{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</Text>
                </div>
              </Group>
            </Stack>
          )}
        </Modal>
      </div>
    </Container>
  );
}

export default UserManagement; 