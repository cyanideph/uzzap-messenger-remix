import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const helpSections = [
  {
    title: 'Intro Help',
    content: 'The Intro Help screen you saw when you first joined Uzzap can be seen again by pressing Options on the Main Menu, then choosing "Intro Help Screen".',
  },
  {
    title: 'Adding New Buddies',
    content: 'Press the "Add or Invite Buddies" button on the Main Menu and choose to add new buddies manually or from your phonebook. If you know their User ID you can add them using this option also.',
  },
  {
    title: 'Sending a message',
    content: 'Press the "EM" button on the Main Menu to see your Buddy List. Scroll to a buddy then press the joystick button on your phone (alternatively press Options then Contact). Now choose Send Message to start a message to this buddy. Type in your message then either press the joystick to send or choose Options to do more – such as add an emoticon or to copy the message to other buddies.',
  },
  {
    title: 'Arrow Symbol - Sending Indicator',
    content: 'The arrow symbol in the Message Tab means that a message you just sent has not been received by your buddy. This could be because they are making a phone call or due to a bad signal area such as in an elevator. Uzzap keeps trying to get the message through automatically and the arrow is cleared when the receipt of the message is confirmed back to you. If the receiving buddy is only available through SMS, then as soon as the SMS is sent the arrow is cleared. If you have messages outstanding when you log-off or exit, Uzzap will warn you. You can check which messages are outstanding by looking for the arrow symbol.',
  },
  {
    title: 'Unread Messages Indicator',
    content: 'The red symbol in the Message Tab means a new message has arrived from that buddy that you have not read.',
  },
  {
    title: 'Messaging Shortcuts',
    content: 'You can reply to a message simply by starting to type your reply while viewing the message from them. You can find a buddy very quickly even from the Main Menu by just typing in their name – try it!',
  },
  {
    title: 'Invite friends',
    content: 'Invite your friends to join so you can benefit from unlimited chat with them. You can invite them from the "Add or Invite Buddies" button on the Main Menu. You can also invite your IM Buddies and any other contacts by selecting them and choosing "Invite". Uzzap can invite via SMS, Email or IM!',
  },
  {
    title: 'Send Contacts',
    content: 'To send Buddy details to a friend, choose the person you wish to send the contact to and then select "Send Contacts". Next you will be shown the list of your buddies and you can choose the ones you wish to send.',
  },
  {
    title: 'User Status',
    content: 'You can change your status either from the "Change Status" button on the Main Menu or by selecting yourself at the top of the Buddy List. As well as selecting from the status options you can create your own Status Message.',
  },
  {
    title: 'Available by SMS',
    content: 'From the Main Menu you can choose "Settings" then "Offline Settings" to choose how you wish messages to be delivered to you when you are not logged in to Uzzap. As well as having your messages delivered via SMS, you can choose Email or to have them stored on the server until you log in again.',
  },
  {
    title: 'Sending SMS and ESMS',
    content: 'Contacts in your Buddy list that are not members of Uzzap can\'t receive EM\'s but Uzzap can still enhance how you can send messages to them. Simply select on one of these contacts (in My Phonebook or Other Contacts) then choose the SMS option that is available. A bucket of ESMS is included in your subscription and is available to Smart mobiles only.',
  },
  {
    title: 'Making a Phone Call',
    content: 'From your Buddy list or in a Message window, simply press the Green Call button on your mobile to call the selected Buddy (only supported on some handset models).',
  },
  {
    title: 'Hide Application',
    content: 'If you are using a Symbian phone, you may continue using other applications on your mobile and remain online by selecting "Hide application" on the Options menu. Uzzap will continue to run in the background – just like a PC application. Uzzap can automatically display a message to you even if it is in the background, just choose the "Settings" button from the Main Menu, then "Auto Message Display" and choose the option you prefer.',
  },
  {
    title: 'Changing your mobile number',
    content: 'You can change your mobile number by pressing "Settings" on the Main Menu, then choosing "Change Mobile Number". Simply type in your new number then wait for the PIN to arrive via SMS. Next time you log in to Uzzap you will be prompted to enter this PIN. Since Uzzap uses an Internet connection, you can log in to your account using any capable phone or PC. However, Uzzap allows your buddies to call your number from their buddy list and also may deliver messages as SMS so you should ensure your mobile number is correct.',
  },
  {
    title: 'Log Off and Exit Application',
    content: 'You can Log Off to get back to the Log In and Registration screen. Alternately you can Exit Application to completely shut Uzzap down.',
  },
];

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Help</Text>
      </View>

      <ScrollView style={styles.content}>
        {helpSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
}); 