import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function SavedScreen() {
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  useFocusEffect(
  useCallback(() => {
    loadSavedArticles();
  }, [])
);

  async function loadSavedArticles() {
    const saved = await AsyncStorage.getItem('savedArticles');
    if (!saved) return;
    const ids = JSON.parse(saved);
    const articles = await Promise.all(
      ids.map(async (id: string) => {
        const article = await AsyncStorage.getItem('savedArticle_' + id);
        return article ? JSON.parse(article) : null;
      })
    );
    setSavedArticles(articles.filter(Boolean));
  }

  async function removeSaved(id: string) {
    const saved = await AsyncStorage.getItem('savedArticles');
    if (!saved) return;
    const ids = JSON.parse(saved).filter((i: string) => i !== id);
    await AsyncStorage.setItem('savedArticles', JSON.stringify(ids));
    await AsyncStorage.removeItem('savedArticle_' + id);
    setSavedArticles(prev => prev.filter(a => a.id !== id));
  }

  if (!fontsLoaded) return <View style={styles.centered} />;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopLine} />
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={styles.headerBottomLine} />
      </View>

      {savedArticles.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>Tap "Save" on any article to read it later</Text>
        </View>
      ) : (
        <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
          {savedArticles.map((article, index) => (
            <View key={article.id}>
              <View style={styles.articleMeta}>
                <Text style={styles.articleNumber}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={styles.articleSource}>{article.source}</Text>
              </View>

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
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeSaved(article.id)}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.ruleSeparator} />
            </View>
          ))}
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
  headerBottomLine: { height: 1, backgroundColor: '#1a1a1a', marginTop: 10 },
  feed: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  articleNumber: { fontSize: 11, color: '#b0a898', fontFamily: 'PlayfairDisplay_700Bold', letterSpacing: 1 },
  articleSource: { fontSize: 10, color: '#9a9080', fontFamily: 'PlayfairDisplay_400Regular', marginLeft: 'auto', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff9f0', borderRadius: 4, padding: 16, borderLeftWidth: 3, borderLeftColor: '#1a1a1a' },
  headline: { fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', lineHeight: 28, marginBottom: 12 },
  summary: { fontSize: 14, fontFamily: 'PlayfairDisplay_400Regular', color: '#4a4438', lineHeight: 24, marginBottom: 14 },
  whyBox: { borderTopWidth: 1, borderTopColor: '#e8e0d0', paddingTop: 12, marginBottom: 14 },
  whyLabel: { fontSize: 9, fontFamily: 'PlayfairDisplay_700Bold', color: '#9a9080', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  whyText: { fontSize: 13, fontFamily: 'PlayfairDisplay_400Regular', color: '#4a4438', lineHeight: 21, fontStyle: 'italic' },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readMore: { fontSize: 12, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', textDecorationLine: 'underline' },
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f0ebe3', borderWidth: 1, borderColor: '#d9d3c7' },
  removeBtnText: { fontSize: 11, fontWeight: '700', color: '#9a9080', textTransform: 'uppercase', letterSpacing: 0.5 },
  ruleSeparator: { height: 1, backgroundColor: '#d9d3c7', marginVertical: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontFamily: 'PlayfairDisplay_700Bold', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, fontFamily: 'PlayfairDisplay_400Regular', color: '#9a9080', textAlign: 'center', paddingHorizontal: 40 },
});