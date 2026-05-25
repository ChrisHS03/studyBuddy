import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import styles from './styles';

const MIN_AUTH_PASSWORD_LENGTH = 6;
const SECTION_TABS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'deadlines', label: 'Deadlines' },
  { key: 'notes', label: 'Notes' },
  { key: 'links', label: 'Links' },
  { key: 'chat', label: 'Chat' },
];

// ===== Helpers: date formatting/parsing =====
const formatDateTime = (value) => {
  if (!value) {
    return 'No deadline';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No deadline';
  }

  return parsedDate.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const parseDueDate = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const normalizedValue = trimmedValue.includes('T') ? trimmedValue : trimmedValue.replace(' ', 'T');
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
};

export default function App() {
  // === State: input, loading og data ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeSection, setActiveSection] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [links, setLinks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // === Derived state ===
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;

  // === Utilities ===
  const normalizePassword = (rawPassword) => {
    if (rawPassword.length >= MIN_AUTH_PASSWORD_LENGTH) {
      return rawPassword;
    }

    return rawPassword.padEnd(MIN_AUTH_PASSWORD_LENGTH, '0');
  };

  // === Workspace helpers (ryddefunktioner) ===
  const clearWorkspace = () => {
    setGroups([]);
    setSelectedGroupId(null);
    setActiveSection('tasks');
    setTasks([]);
    setNotes([]);
    setLinks([]);
    setMessages([]);
  };

  // === Form helpers (ryd/skift formularfelter) ===
  const clearGroupForms = () => {
    setGroupName('');
    setGroupDescription('');
    setTaskTitle('');
    setTaskDescription('');
    setTaskDue('');
    setNoteTitle('');
    setNoteBody('');
    setLinkTitle('');
    setLinkUrl('');
    setMessageBody('');
  };

  // === Data loaders: hent tasks/notes/links/messages for gruppe ===
  const loadGroupContent = async (groupId) => {
    if (!supabase || !groupId) {
      setTasks([]);
      setNotes([]);
      setLinks([]);
      setMessages([]);
      return { error: null };
    }

    const [tasksResult, notesResult, linksResult, messagesResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
      supabase.from('notes').select('*').eq('group_id', groupId).order('updated_at', { ascending: false }),
      supabase.from('links').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('group_id', groupId).order('created_at', { ascending: true }),
    ]);

    const firstError = tasksResult.error ?? notesResult.error ?? linksResult.error ?? messagesResult.error;

    if (firstError) {
      return { error: firstError.message };
    }

    setTasks(tasksResult.data ?? []);
    setNotes(notesResult.data ?? []);
    setLinks(linksResult.data ?? []);
    setMessages(messagesResult.data ?? []);

    return { error: null };
  };

  // === Workspace loader: hent brugerens gruppe-medlemskaber og grupper ===
  const loadWorkspace = async (preferredGroupId = null) => {
    if (!supabase || !session) {
      clearWorkspace();
      return;
    }

    setLoadingData(true);
    setErrorMessage('');

    const { data: membershipRows, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id, role, joined_at')
      .eq('user_id', session.user.id)
      .order('joined_at', { ascending: false });

    if (membershipError) {
      setErrorMessage(membershipError.message);
      clearWorkspace();
      setLoadingData(false);
      return;
    }

    const nextGroupIds = (membershipRows ?? []).map((row) => row.group_id);

    if (!nextGroupIds.length) {
      clearWorkspace();
      setLoadingData(false);
      return;
    }

    const { data: groupRows, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, description, created_at')
      .in('id', nextGroupIds);

    if (groupsError) {
      setErrorMessage(groupsError.message);
      clearWorkspace();
      setLoadingData(false);
      return;
    }

    const groupMap = new Map((groupRows ?? []).map((group) => [group.id, group]));
    const nextGroups = (membershipRows ?? [])
      .map((row) => {
        const group = groupMap.get(row.group_id);

        if (!group) {
          return null;
        }

        return {
          id: group.id,
          name: group.name,
          description: group.description ?? '',
          createdAt: group.created_at,
          role: row.role,
        };
      })
      .filter(Boolean);

    setGroups(nextGroups);

    const nextSelectedGroupId = preferredGroupId && nextGroups.some((group) => group.id === preferredGroupId)
      ? preferredGroupId
      : nextGroups[0]?.id ?? null;

    setSelectedGroupId(nextSelectedGroupId);

    if (!nextSelectedGroupId) {
      clearWorkspace();
      setLoadingData(false);
      return;
    }

    const contentResult = await loadGroupContent(nextSelectedGroupId);

    if (contentResult.error) {
      setErrorMessage(contentResult.error);
    }

    setLoadingData(false);
  };

  // === Effect: lyt på auth/session ændringer fra Supabase ===
  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  // === Effect: når session ændres, indlæs workspace ===
  useEffect(() => {
    if (session) {
      void loadWorkspace();
      return;
    }

    clearWorkspace();
  }, [session]);

  // === Auth handlers: signIn / signUp / signOut ===
  const handleSignIn = async () => {
    if (!supabase) {
      Alert.alert('Missing Supabase key', 'Check your Supabase URL and key, then restart Expo.');
      return;
    }

    setLoadingAuth(true);
    setErrorMessage('');

    const rawPassword = password;
    const paddedPassword = normalizePassword(password);

    let { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: rawPassword,
    });

    if (error && paddedPassword !== rawPassword) {
      const fallback = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: paddedPassword,
      });

      error = fallback.error;
    }

    if (error) {
      setErrorMessage(error.message);
    }

    setLoadingAuth(false);
  };

  const handleSignUp = async () => {
    if (!supabase) {
      Alert.alert('Missing Supabase key', 'Check your Supabase URL and key, then restart Expo.');
      return;
    }

    setLoadingAuth(true);
    setErrorMessage('');

    const authPassword = normalizePassword(password);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: authPassword,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoadingAuth(false);
      return;
    }

    if (!data.session) {
      Alert.alert('Check your email', 'Supabase sent a confirmation link. Confirm your email, then sign in.');
    }

    setLoadingAuth(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    setLoadingAuth(true);
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
    setErrorMessage('');
    clearWorkspace();
    setLoadingAuth(false);
  };

  // === CRUD handlers: groups, tasks, notes, links, messages ===
  const handleCreateGroup = async () => {
    if (!supabase || !session) {
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Missing name', 'Add a group name first.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('groups')
      .insert({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        created_by: session.user.id,
      })

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    clearGroupForms();
    await loadWorkspace();
    setActiveSection('tasks');
    setSaving(false);
  };

  const handleSelectGroup = async (groupId) => {
    if (groupId === selectedGroupId) {
      return;
    }

    setSelectedGroupId(groupId);
    setActiveSection('tasks');
    setLoadingData(true);

    const contentResult = await loadGroupContent(groupId);

    if (contentResult.error) {
      setErrorMessage(contentResult.error);
    }

    setLoadingData(false);
  };

  const handleCreateTask = async () => {
    if (!supabase || !session || !selectedGroupId) {
      return;
    }

    if (!taskTitle.trim()) {
      Alert.alert('Missing title', 'Add a task title first.');
      return;
    }

    const dueAt = parseDueDate(taskDue);

    if (dueAt === undefined) {
      Alert.alert('Invalid date', 'Use a valid deadline like 2026-05-25 or 2026-05-25 14:30.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase.from('tasks').insert({
      group_id: selectedGroupId,
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      due_at: dueAt,
      created_by: session.user.id,
      status: 'todo',
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setTaskTitle('');
    setTaskDescription('');
    setTaskDue('');
    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleToggleTaskStatus = async (task) => {
    if (!supabase || !selectedGroupId) {
      return;
    }

    const nextStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';

    setSaving(true);
    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus })
      .eq('id', task.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!supabase || !selectedGroupId) {
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleCreateNote = async () => {
    if (!supabase || !session || !selectedGroupId) {
      return;
    }

    if (!noteBody.trim()) {
      Alert.alert('Missing note', 'Add some text to save the note.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase.from('notes').insert({
      group_id: selectedGroupId,
      title: noteTitle.trim() || null,
      body: noteBody.trim(),
      created_by: session.user.id,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setNoteTitle('');
    setNoteBody('');
    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (!supabase || !selectedGroupId) {
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleCreateLink = async () => {
    if (!supabase || !session || !selectedGroupId) {
      return;
    }

    if (!linkTitle.trim() || !linkUrl.trim()) {
      Alert.alert('Missing info', 'Add both a title and a URL.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase.from('links').insert({
      group_id: selectedGroupId,
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      created_by: session.user.id,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setLinkTitle('');
    setLinkUrl('');
    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleDeleteLink = async (linkId) => {
    if (!supabase || !selectedGroupId) {
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('links').delete().eq('id', linkId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  const handleOpenLink = async (url) => {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert('Invalid link', 'This URL cannot be opened.');
      return;
    }

    await Linking.openURL(url);
  };

  const handleSendMessage = async () => {
    if (!supabase || !session || !selectedGroupId) {
      return;
    }

    if (!messageBody.trim()) {
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase.from('messages').insert({
      group_id: selectedGroupId,
      sender_id: session.user.id,
      body: messageBody.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessageBody('');
    await loadGroupContent(selectedGroupId);
    setSaving(false);
  };

  // === Render: Auth screen (login/signup) ===
  const renderAuthScreen = () => (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StatusBar style='dark' />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps='handled'>
            <View style={styles.brandBlock}>
              <Text style={styles.brandTitle}>Study Buddy</Text>
              <Text style={styles.brandSubtitle}>Study smarter, not harder</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.formTitle}>Sign in</Text>
              <Text style={styles.formSubtitle}>Or create a new account</Text>

              {!supabase && <Text style={styles.noticeText}>Check your Supabase URL and key, then restart Expo with --clear.</Text>}

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                autoCapitalize='none'
                keyboardType='email-address'
                textContentType='emailAddress'
                style={styles.input}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder='Password'
                secureTextEntry
                textContentType='password'
                style={styles.input}
              />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <View style={styles.buttonRow}>
                <Pressable style={[styles.buttonBase, styles.rowButton, styles.primaryButton]} onPress={handleSignIn} disabled={loadingAuth || !supabase}>
                  <Text style={styles.primaryButtonText}>{loadingAuth ? 'Signing in...' : 'Sign in'}</Text>
                </Pressable>

                <Pressable style={[styles.buttonBase, styles.rowButton, styles.secondaryButton]} onPress={handleSignUp} disabled={loadingAuth || !supabase}>
                  <Text style={styles.secondaryButtonText}>{loadingAuth ? 'Creating...' : 'Sign up'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );

  // === Render: Sektion-tabs (Tasks / Deadlines / Notes / Links / Chat) ===
  const renderSectionTabs = () => (
    <View style={styles.tabRow}>
      {SECTION_TABS.map((tab) => (
        <Pressable key={tab.key} onPress={() => setActiveSection(tab.key)} style={[styles.tabButton, activeSection === tab.key && styles.tabButtonActive]}>
          <Text style={[styles.tabButtonText, activeSection === tab.key && styles.tabButtonTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  // === Render: Groups-list + create group UI ===
  const renderGroups = () => (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.formTitle}>Groups</Text>
          <Text style={styles.formSubtitle}>{groups.length} active group{groups.length === 1 ? '' : 's'}</Text>
        </View>

        {loadingData ? <ActivityIndicator color='#0f172a' /> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {groups.map((group) => {
          const isSelected = group.id === selectedGroupId;

          return (
            <Pressable key={group.id} onPress={() => handleSelectGroup(group.id)} style={[styles.groupChip, isSelected && styles.groupChipActive]}>
              <Text style={[styles.groupChipTitle, isSelected && styles.groupChipTitleActive]}>{group.name}</Text>
              <Text style={[styles.groupChipSubtitle, isSelected && styles.groupChipSubtitleActive]}>{group.role}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        placeholder='New group name'
        style={styles.input}
      />

      <TextInput
        value={groupDescription}
        onChangeText={setGroupDescription}
        placeholder='Group description'
        style={[styles.input, styles.multilineInput]}
        multiline
      />

      <Pressable style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton]} onPress={handleCreateGroup} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Create group'}</Text>
      </Pressable>
    </View>
  );

  // === Render: Tasks UI ===
  const renderTasks = () => (
    <View>
      <Text style={styles.sectionLabel}>Tasks</Text>

      <TextInput value={taskTitle} onChangeText={setTaskTitle} placeholder='Task title' style={styles.input} />
      <TextInput value={taskDescription} onChangeText={setTaskDescription} placeholder='Task description' style={[styles.input, styles.multilineInput]} multiline />
      <TextInput value={taskDue} onChangeText={setTaskDue} placeholder='Deadline: YYYY-MM-DD HH:MM' style={styles.input} />

      <Pressable style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton]} onPress={handleCreateTask} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Add task'}</Text>
      </Pressable>

      <View style={styles.listBlock}>
        {tasks.length ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{task.title}</Text>
                <Text style={styles.statusBadge}>{task.status}</Text>
              </View>

              {task.description ? <Text style={styles.listItemBody}>{task.description}</Text> : null}
              <Text style={styles.metaText}>Deadline: {formatDateTime(task.due_at)}</Text>

              <View style={styles.itemActionRow}>
                <Pressable style={[styles.buttonBase, styles.smallButton, styles.secondaryButton]} onPress={() => handleToggleTaskStatus(task)} disabled={saving}>
                  <Text style={styles.secondaryButtonText}>Next status</Text>
                </Pressable>

                <Pressable style={[styles.buttonBase, styles.smallButton, styles.dangerButton]} onPress={() => handleDeleteTask(task.id)} disabled={saving}>
                  <Text style={styles.dangerButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks yet. Add the first one above.</Text>
        )}
      </View>
    </View>
  );

  // === Render: Deadlines view ===
  const renderDeadlines = () => {
    const upcomingTasks = [...tasks]
      .filter((task) => task.due_at)
      .sort((left, right) => new Date(left.due_at).getTime() - new Date(right.due_at).getTime());

    return (
      <View>
        <Text style={styles.sectionLabel}>Deadlines</Text>
        <Text style={styles.sectionHint}>Tasks with a deadline, sorted by nearest date.</Text>

        <View style={styles.listBlock}>
          {upcomingTasks.length ? (
            upcomingTasks.map((task) => (
              <View key={task.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{task.title}</Text>
                <Text style={styles.metaText}>{formatDateTime(task.due_at)}</Text>
                {task.description ? <Text style={styles.listItemBody}>{task.description}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No deadlines yet.</Text>
          )}
        </View>
      </View>
    );
  };

  // === Render: Notes UI ===
  const renderNotes = () => (
    <View>
      <Text style={styles.sectionLabel}>Notes</Text>

      <TextInput value={noteTitle} onChangeText={setNoteTitle} placeholder='Note title' style={styles.input} />
      <TextInput value={noteBody} onChangeText={setNoteBody} placeholder='Write your note...' style={[styles.input, styles.largeInput]} multiline />

      <Pressable style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton]} onPress={handleCreateNote} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save note'}</Text>
      </Pressable>

      <View style={styles.listBlock}>
        {notes.length ? (
          notes.map((note) => (
            <View key={note.id} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{note.title || 'Untitled note'}</Text>
                <Pressable onPress={() => handleDeleteNote(note.id)} disabled={saving}>
                  <Text style={styles.linkAction}>Delete</Text>
                </Pressable>
              </View>
              <Text style={styles.listItemBody}>{note.body}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No notes yet.</Text>
        )}
      </View>
    </View>
  );

  // === Render: Links UI ===
  const renderLinks = () => (
    <View>
      <Text style={styles.sectionLabel}>Links</Text>

      <TextInput value={linkTitle} onChangeText={setLinkTitle} placeholder='Link title' style={styles.input} />
      <TextInput value={linkUrl} onChangeText={setLinkUrl} placeholder='https://...' autoCapitalize='none' style={styles.input} />

      <Pressable style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton]} onPress={handleCreateLink} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save link'}</Text>
      </Pressable>

      <View style={styles.listBlock}>
        {links.length ? (
          links.map((link) => (
            <View key={link.id} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{link.title}</Text>
                <Pressable onPress={() => handleDeleteLink(link.id)} disabled={saving}>
                  <Text style={styles.linkAction}>Delete</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => handleOpenLink(link.url)}>
                <Text style={styles.linkText}>{link.url}</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No links yet.</Text>
        )}
      </View>
    </View>
  );

  // === Render: Chat UI ===
  const renderChat = () => (
    <View>
      <Text style={styles.sectionLabel}>Chat</Text>

      <View style={styles.messageList}>
            {messages.length ? (
          messages.map((message) => {
            const isMine = message.sender_id === session?.user?.id;

            return (
              <View key={message.id} style={[styles.messageBubble, isMine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
                <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{message.body}</Text>
                <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>{formatDateTime(message.created_at)}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No messages yet.</Text>
        )}
      </View>

      <TextInput value={messageBody} onChangeText={setMessageBody} placeholder='Write a message...' style={[styles.input, styles.largeInput]} multiline />

      <Pressable style={[styles.buttonBase, styles.primaryButton, styles.fullWidthButton]} onPress={handleSendMessage} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Sending...' : 'Send message'}</Text>
      </Pressable>
    </View>
  );

  // === Render: vælg aktiv sektion ===
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'deadlines':
        return renderDeadlines();
      case 'notes':
        return renderNotes();
      case 'links':
        return renderLinks();
      case 'chat':
        return renderChat();
      case 'tasks':
      default:
        return renderTasks();
    }
  };

  if (!session) {
    return renderAuthScreen();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StatusBar style='dark' />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.dashboardContent} keyboardShouldPersistTaps='handled'>
            <View style={styles.heroCard}>
              <View>
                <Text style={styles.brandTitle}>Study Buddy</Text>
                <Text style={styles.brandSubtitle}>Logged in as {session.user.email}</Text>
              </View>

              <Pressable style={[styles.buttonBase, styles.secondaryButton, styles.signOutButton]} onPress={handleSignOut} disabled={loadingAuth}>
                <Text style={styles.secondaryButtonText}>{loadingAuth ? 'Signing out...' : 'Sign out'}</Text>
              </Pressable>
            </View>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {renderGroups()}

            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.formTitle}>{selectedGroup?.name ?? 'No group selected'}</Text>
                  <Text style={styles.formSubtitle}>{selectedGroup?.description || 'Create or select a group to start.'}</Text>
                </View>

                {loadingData ? <ActivityIndicator color='#0f172a' /> : null}
              </View>

              <Text style={styles.groupMeta}>{selectedGroup ? `Role: ${selectedGroup.role}` : 'Start by creating a group above.'}</Text>

              {selectedGroup ? renderSectionTabs() : null}

              <View style={styles.sectionPanel}>
                {selectedGroup ? renderActiveSection() : <Text style={styles.emptyText}>No group selected yet.</Text>}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}