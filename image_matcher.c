#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Structure representing an indexed image in our mock database
typedef struct {
    int id;
    char title[100];
    char source[50];
    char image_url[250];
    int base_score;
} ImageRecord;

// Mock Database of indexed images across the web/social media
ImageRecord database[] = {
    {1, "Sunset over Mountain Peak", "Instagram", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400", 98},
    {2, "Neon Cyberpunk City Street", "ArtStation", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400", 92},
    {3, "Minimalist Architecture", "Pinterest", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", 87},
    {4, "Serene Forest Pathway", "Twitter/X", "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", 81},
    {5, "Ocean Waves & Cliffside", "Unsplash", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", 76}
};

int main(int argc, char *argv[]) {
    // Expecting image file path or mock hash seed as argument from Python bridge
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <image_path_or_hash>\n", argv[0]);
        return 1;
    }

    char *input_path = argv[1];

    // High-performance simulation: compute a pseudo-hash based on filename string length/chars
    unsigned long dummy_hash = 0;
    for (int i = 0; input_path[i] != '\0'; i++) {
        dummy_hash = (dummy_hash * 31) + (unsigned long)input_path[i];
    }

    // Sort or rank database items based on simulated proximity score
    int num_results = 3; // Return top 3 matches
    
    // Output valid JSON format so Python controller can easily parse it
    printf("{\n");
    printf("  \"status\": \"success\",\n");
    printf("  \"matches\": [\n");

    for (int i = 0; i < num_results; i++) {
        // Vary similarity slightly based on hash modulo to feel dynamic
        int adjusted_score = database[i].base_score - (int)(dummy_hash % (i + 3));
        if (adjusted_score > 99) adjusted_score = 99;
        if (adjusted_score < 60) adjusted_score = 60;

        printf("    {\n");
        printf("      \"id\": %d,\n", database[i].id);
        printf("      \"title\": \"%s\",\n", database[i].title);
        printf("      \"source\": \"%s\",\n", database[i].source);
        printf("      \"image_url\": \"%s\",\n", database[i].image_url);
        printf("      \"similarity\": %d\n", adjusted_score);
        printf("    }%s\n", (i == num_results - 1) ? "" : ",");
    }

    printf("  ]\n");
    printf("}\n");

    return 0;
}
