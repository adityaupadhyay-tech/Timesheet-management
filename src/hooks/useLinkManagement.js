import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

/**
 * Custom hook for managing external links CRUD operations
 */
export function useLinkManagement() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Fetch all links
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast.error('Failed to fetch links.', { description: error.message });
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Save link (create or update)
  const saveLink = useCallback(async (linkData) => {
    try {
      const dataToSave = {
        label: linkData.label,
        web_address: linkData.web_address,
        description: linkData.description,
        type: linkData.type,
        display: linkData.display,
        show_in_menu: linkData.show_in_menu,
        top_level_menu: linkData.top_level_menu || null,
        menu_category: linkData.menu_category || null,
      };

      let error;
      if (linkData.id) {
        // Update existing link
        ({ error } = await supabase
          .from('links')
          .update(dataToSave)
          .eq('id', linkData.id));
      } else {
        // Create new link
        ({ error } = await supabase.from('links').insert(dataToSave));
      }

      if (error) throw error;
      
      toast.success(
        `Link has been successfully ${linkData.id ? 'updated' : 'added'}.`
      );

      await fetchLinks(); // Refresh data
      return { success: true };
    } catch (error) {
      toast.error('Failed to save the link.', { description: error.message });
      console.error('Error saving link:', error);
      return { success: false, error: error.message };
    }
  }, [supabase, fetchLinks]);

  // Delete link
  const deleteLink = useCallback(async (linkId) => {
    if (!linkId) return { success: false };

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;

      toast.success('Link deleted successfully.');
      await fetchLinks(); // Refresh data
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete the link.', { description: error.message });
      console.error('Error deleting link:', error);
      return { success: false, error: error.message };
    }
  }, [supabase, fetchLinks]);

  return {
    links,
    loading,
    fetchLinks,
    saveLink,
    deleteLink,
  };
}

