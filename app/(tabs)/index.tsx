import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking, RefreshControl,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';

const CATEGORIES = ['All', 'AI', 'Tech', 'Startups'];

const CATEGORY_STYLES: Record<string, any> = {
  AI:       { bg: '#1a1a1a', text: '#f5f0e8' },
  Tech:     { bg: '#2c2c2c', text: '#f5f0e8' },
  Startups: { bg: '#3d2b00', text: '#f5d98b' },
  All:      { bg: '#f5f0e8', text: '#1a1a1a' },
};

export default function HomeScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    async function loadSaved() {
      const saved = await AsyncStorage.getItem('savedArticles');
      if (saved) setSavedIds(JSON.parse(saved));
    }
    loadSaved();
  }, []);

  async function toggleSave(article: any) {
    const saved = await AsyncStorage.getItem('savedArticles');
    let savedList = saved ? JSON.parse(saved) : [];
    if (savedList.includes(article.id)) {
      savedList = savedList.filter((id: string) => id !== article.id);
    } else {
      savedList.push(article.id);
      await AsyncStorage.setItem('savedArticle_' + article.id, JSON.stringify(article));
    }
    await AsyncStorage.setItem('savedArticles', JSON.stringify(savedList));
    setSavedIds([...savedList]);
  }

  async function toggleSpeak(article: any) {
    if (speakingId === article.id) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }
    Speech.stop();
    setSpeakingId(article.id);
    const text = `${article.title}. ${article.summary}. Why it matters: ${article.why_it_matters}`;
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  }

  async function fetchArticles(category: string) {
    setLoading(true);
    const q = category === 'All'
      ? query(collection(db, 'articles'))
      : query(collection(db, 'articles'), where('category', '==', category));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setArticles(data);
    setLoading(false);
  }

  useEffect(() => { fetchArticles(activeCategory); }, [activeCategory]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchArticles(activeCategory);
    setRefreshing(false);
  }

  if (!fontsLoaded) return <View style={styles.centered}><ActivityIndicator color="#1a1a1a" /></View>;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopLine} />
        <Text style={styles.headerTitle}>60sec News</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          <Text style={styles.headerSub}>Your Daily Tech Brief</Text>
        </View>
        <View style={styles.headerBottomLine} />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.tab, activeCategory === cat && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.feed}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a1a1a" />}
        >
          {articles.map((article, index) => {
            const cat = CATEGORY_STYLES[article.category] || CATEGORY_STYLES['All'];
            const isSaved = savedIds.includes(article.id);
            const isSpeaking = speakingId === article.id;
            return (
              <View key={article.id}>

                {/* Article Meta */}
                <View style={styles.articleMeta}>
                  <Text style={styles.articleNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}>
                    <Text style={[styles.categoryPillText, { color: cat.text }]}>{article.category}</Text>
                  </View>
                  <Text style={styles.articleSource}>{article.source}</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                  <Text style={styles.headline}>{article.title}</Text>
                  <Text style={styles.summary}>{article.summary}</Text>

                  <View style={styles.whyBox}>
                    <Text style={styles.whyLabel}>Why It Matters</Text>
                    <Text style={styles.whyText}>{article.why_it_matters}</Text>
                  </View>

                  <View style={styles.cardFooterRow}>
                    {article.url && (
                      <TouchableOpacity onPress={() => Linking.openURL(article.url)}>
                        <Text style={styles.readMore}>Read full article</Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, isSpeaking && styles.actionBtnActive]}
                        onPress={() => toggleSpeak(article)}
                      >
                        <Text style={[styles.actionBtnText, isSpeaking && styles.actionBtnTextActive]}>
                          {isSpeaking ? 'Stop' : 'Listen'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, isSaved && styles.actionBtnActive]}
                        onPress={() => toggleSave(article)}
                      >
                        <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextActive]}>
                          {isSaved ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.ruleSeparator} />
              </View>
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#f5f0e8' },
  headerTopLine: { height: 3, backgroundColor: '#1a1a1a', marginBottom: 10 },
  headerTitle: { fontSize: 38, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', letterSpacing: -1, textAlign: 'center' },
  headerMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  headerDate: { fontSize: 11, color: '#6b6b6b', fontFamily: 'PlayfairDisplay_400Regular', letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: '#6b6b6b', fontFamily: 'PlayfairDisplay_400Regular', letterSpacing: 0.5, textTransform: 'uppercase' },
  headerBottomLine: { height: 1, backgroundColor: '#1a1a1a', marginTop: 10 },
  tabsContainer: { maxHeight: 48, backgroundColor: '#f5f0e8', borderBottomWidth: 1, borderBottomColor: '#d9d3c7' },
  tabsContent: { paddingHorizontal: 16, alignItems: 'center' },
  tab: { paddingHorizontal: 16, paddingVertical: 6, marginRight: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1a1a1a' },
  tabText: { color: '#9a9080', fontSize: 12, fontFamily: 'PlayfairDisplay_600SemiBold', textTransform: 'uppercase', letterSpacing: 1 },
  tabTextActive: { color: '#1a1a1a' },
  feed: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  articleNumber: { fontSize: 11, color: '#b0a898', fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  categoryPillText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  articleSource: { fontSize: 10, color: '#9a9080', fontFamily: 'PlayfairDisplay_400Regular', marginLeft: 'auto', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff9f0', borderRadius: 4, padding: 16, borderLeftWidth: 3, borderLeftColor: '#1a1a1a' },
  headline: { fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', lineHeight: 28, marginBottom: 12 },
  summary: { fontSize: 14, fontFamily: 'PlayfairDisplay_400Regular', color: '#4a4438', lineHeight: 24, marginBottom: 14 },
  whyBox: { borderTopWidth: 1, borderTopColor: '#e8e0d0', paddingTop: 12, marginBottom: 14 },
  whyLabel: { fontSize: 9, fontFamily: 'PlayfairDisplay_700Bold', color: '#9a9080', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  whyText: { fontSize: 13, fontFamily: 'PlayfairDisplay_400Regular', color: '#4a4438', lineHeight: 21, fontStyle: 'italic' },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readMore: { fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', textDecorationLine: 'underline' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f0ebe3', borderWidth: 1, borderColor: '#d9d3c7' },
  actionBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: '#9a9080', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionBtnTextActive: { color: '#f5f0e8' },
  ruleSeparator: { height: 1, backgroundColor: '#d9d3c7', marginVertical: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f0e8' },
  loadingText: { color: '#9a9080', marginTop: 12, fontSize: 13, fontFamily: 'PlayfairDisplay_400Regular' },
});