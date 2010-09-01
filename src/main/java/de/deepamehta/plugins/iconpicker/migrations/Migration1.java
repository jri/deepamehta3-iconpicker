package de.deepamehta.plugins.iconpicker.migrations;

import de.deepamehta.core.model.Relation;
import de.deepamehta.core.model.Topic;
import de.deepamehta.core.model.TopicType;
import de.deepamehta.core.service.Migration;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;



public class Migration1 extends Migration {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private final Logger logger = Logger.getLogger(getClass().getName());

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        createIconTopics();
    }

    // ------------------------------------------------------------------------------------------------- Private Methods

    private void createIconTopics() {
        for (String typeURI : dms.getTopicTypeUris()) {
            logger.info("### Handling icon topic for type " + typeURI + " ...");
            TopicType type = dms.getTopicType(typeURI);
            String iconSrc = (String) type.getProperty("icon_src", null);
            if (iconSrc == null) {
                logger.info("  # Type has no icon_src declaration -> no icon topic needed");
                continue;
            } else {
                logger.info("  # Type has icon_src declaration: \"" + iconSrc + "\" -> icon topic is needed");
            }
            // create icon topic
            Topic iconTopic = getIconTopic(iconSrc);
            if (iconTopic == null) {
                iconTopic = createIconTopic(iconSrc);
                logger.info("  # Creating icon topic for that source -> ID=" + iconTopic.id);
            } else {
                logger.info("  # Icon topic for that source exists already (ID=" + iconTopic.id + ")");
            }
            // relate type to icon
            Relation relation = dms.getRelation(type.id, iconTopic.id, "RELATION", true);
            if (relation == null) {
                relateTypeToIcon(type.id, iconTopic.id);
                logger.info("  # Creating relation between type and icon topic");
            } else {
                logger.info("  # Relation between type and icon topic exists already");
            }
        }
    }

    private Topic getIconTopic(String iconSrc) {
        return dms.getTopic("de/deepamehta/core/property/IconSource", iconSrc);
    }

    private Topic createIconTopic(String iconSrc) {
        Map properties = new HashMap();
        properties.put("de/deepamehta/core/property/IconSource", iconSrc);
        return dms.createTopic("de/deepamehta/core/topictype/Icon", properties, null);
    }

    private void relateTypeToIcon(long typeId, long iconId) {
        dms.createRelation("RELATION", typeId, iconId, null);
    }
}
