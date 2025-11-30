"""
Smart Memory System - User Corrections Database
Allows the system to "learn" from user corrections instantly
"""
import json
import hashlib
from typing import Optional, Dict, List
from datetime import datetime
from pathlib import Path
from core.utils import logger

class UserMemory:
    """
    Stores and retrieves user-corrected translations.
    Acts as a priority layer before the AI model.
    """
    
    def __init__(self, storage_path: str = "data/user_memory.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.memory: Dict[str, Dict] = {}
        self.load_memory()
    
    def _make_key(self, text: str, source_lang: str, target_lang: str = "english") -> str:
        """Create unique key for translation pair"""
        key_string = f"{source_lang}:{target_lang}:{text.strip().lower()}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def load_memory(self):
        """Load user corrections from disk"""
        try:
            if self.storage_path.exists():
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    self.memory = json.load(f)
                logger.info(f"📚 Loaded {len(self.memory)} user corrections from memory")
            else:
                self.memory = {}
                logger.info("📚 Starting with empty user memory")
        except Exception as e:
            logger.error(f"Failed to load user memory: {e}")
            self.memory = {}
    
    def save_memory(self):
        """Save user corrections to disk"""
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
            logger.info(f"💾 Saved {len(self.memory)} user corrections")
        except Exception as e:
            logger.error(f"Failed to save user memory: {e}")
    
    def get_correction(self, text: str, source_lang: str, target_lang: str = "english") -> Optional[str]:
        """
        Get user-corrected translation if it exists
        
        Args:
            text: Source text
            source_lang: Source language
            target_lang: Target language
            
        Returns:
            User-corrected translation or None
        """
        key = self._make_key(text, source_lang, target_lang)
        
        if key in self.memory:
            entry = self.memory[key]
            # Increment usage count
            entry['usage_count'] = entry.get('usage_count', 0) + 1
            entry['last_used'] = datetime.now().isoformat()
            self.save_memory()
            
            logger.info(f"✅ User memory hit: '{text[:30]}...' → '{entry['correction'][:30]}...'")
            return entry['correction']
        
        return None
    
    def add_correction(
        self,
        text: str,
        ai_translation: str,
        user_correction: str,
        source_lang: str,
        target_lang: str = "english",
        user_id: Optional[str] = None
    ):
        """
        Store a user correction
        
        Args:
            text: Original source text
            ai_translation: What the AI translated
            user_correction: What the user corrected it to
            source_lang: Source language
            target_lang: Target language
            user_id: Optional user identifier
        """
        key = self._make_key(text, source_lang, target_lang)
        
        self.memory[key] = {
            'original': text,
            'ai_translation': ai_translation,
            'correction': user_correction,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'created_at': datetime.now().isoformat(),
            'last_used': datetime.now().isoformat(),
            'usage_count': 0,
            'user_id': user_id
        }
        
        self.save_memory()
        logger.info(f"📝 Stored user correction: '{text[:30]}...' → '{user_correction[:30]}...'")
    
    def get_all_corrections(self) -> List[Dict]:
        """Get all user corrections for analysis or retraining"""
        return list(self.memory.values())
    
    def get_stats(self) -> Dict:
        """Get statistics about user corrections"""
        total = len(self.memory)
        if total == 0:
            return {
                'total_corrections': 0,
                'most_used': None,
                'languages': {}
            }
        
        # Count by language
        lang_counts = {}
        most_used = max(self.memory.values(), key=lambda x: x.get('usage_count', 0))
        
        for entry in self.memory.values():
            lang = entry['source_lang']
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
        
        return {
            'total_corrections': total,
            'most_used': {
                'text': most_used['original'],
                'correction': most_used['correction'],
                'usage_count': most_used.get('usage_count', 0)
            },
            'languages': lang_counts
        }
    
    def export_for_training(self, output_path: str):
        """Export corrections in format suitable for model retraining"""
        training_data = []
        
        for entry in self.memory.values():
            # Only export corrections that have been used multiple times
            # (indicates they're high quality)
            if entry.get('usage_count', 0) >= 2:
                training_data.append({
                    'source': entry['original'],
                    'target': entry['correction'],
                    'source_lang': entry['source_lang'],
                    'target_lang': entry['target_lang']
                })
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"📤 Exported {len(training_data)} high-quality corrections for training")
        return len(training_data)


# Global user memory instance
user_memory = UserMemory()
