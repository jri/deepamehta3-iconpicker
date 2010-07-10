function dm3_iconpicker() {



    /**************************************************************************************************/
    /**************************************** Overriding Hooks ****************************************/
    /**************************************************************************************************/



    this.init = function() {
        create_icon_dialog()
    }

    this.render_field_content = function(field, topic, rel_topics) {
        if (field.model.type == "relation" && field.view.editor == "iconpicker") {
            return render_topics_icon(rel_topics)
        }
    }

    this.render_form_field = function(field, doc, rel_topics) {
        if (field.model.type == "relation" && field.view.editor == "iconpicker") {
            var a = $("<a>").attr({href: "#", "field-uri": field.uri, title: "Choose Icon"}).click(open_icon_dialog)
            return a.append(render_topics_icon(rel_topics))
        }
    }

    this.get_field_content = function(field, doc) {
        if (field.model.type == "relation" && field.view.editor == "iconpicker") {
            var icons = get_doctype_impl(doc).topic_buffer[field.uri]
            var old_icon_id = icons.length && icons[0].id
            var new_icon_id = $("[field-uri=" + field.uri + "] img").attr("icon-topic-id")
            if (old_icon_id) {
                if (old_icon_id != new_icon_id) {
                    // re-assign icon
                    delete_relation(dmc.get_relation(doc.id, old_icon_id).id)
                    create_relation("RELATION", doc.id, new_icon_id)
                }
            } else if (new_icon_id) {
                // assign icon
                create_relation("RELATION", doc.id, new_icon_id)
            }
            // prevent this field from being updated
            return null
        }
    }



    /************************************************************************************************/
    /**************************************** Custom Methods ****************************************/
    /************************************************************************************************/



    function create_icon_dialog() {
        $("body").append($("<div>").attr("id", "icon_dialog"))
        $("#icon_dialog").dialog({title: "Choose Icon", modal: true, autoOpen: false,
            draggable: false, resizable: false, width: 350})
    }

    function open_icon_dialog() {
        // query icon topics
        var icon_topics = dmc.get_topics("de/deepamehta/core/topictype/Icon")
        // fill dialog with icons
        $("#icon_dialog").empty()
        for (var i = 0, icon_topic; icon_topic = icon_topics[i]; i++) {
            var a = $("<a>").attr({href: "#", title: icon_topic.label}).click(icon_selected(icon_topic, this))
            $("#icon_dialog").append(a.append(render_icon(icon_topic)))
        }
        // open dialog
        $("#icon_dialog").dialog("open")
        //
        return false
    }

    function icon_selected(icon_topic, target) {
        return function() {
            // alert("selected icon=" + JSON.stringify(icon_topic))
            $("#icon_dialog").dialog("close")
            $(target).empty().append(render_icon(icon_topic))
            return false
        }
    }

    //

    function render_topics_icon(rel_topics) {
        if (!rel_topics.length) {
            return "<i>no icon</i>"
        }
        return render_icon(rel_topics[0])
    }

    /**
     * @param   icon_topic    a topic of type "Icon"
     */
    function render_icon(icon_topic) {
        var icon_src = icon_topic.properties["de/deepamehta/core/property/IconSource"]
        return $("<img>").attr({"icon-topic-id": icon_topic.id, src: icon_src}).addClass("type-icon")
    }
}
