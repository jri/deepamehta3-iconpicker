function dm3_iconpicker() {



    /**************************************************************************************************/
    /**************************************** Overriding Hooks ****************************************/
    /**************************************************************************************************/



    this.init = function() {
        create_icon_dialog()
    }

    this.render_field_content = function(field, doc, rel_topics) {
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
            var new_icon_id = $("[field-uri=" + field.uri + "] img").attr("id")
            // alert("Old selection of field \"" + field.uri + "\": " + icons.length + " icons.\n" +
            //     (icons.length ? JSON.stringify(icons[0]) + "\n" : "") + "New selected icon: " + new_icon_id)
            if (old_icon_id) {
                if (old_icon_id != new_icon_id) {
                    // alert("icon changed")
                    delete_relation(get_relation_doc(doc._id, old_icon_id)._id)
                    create_relation("Relation", doc._id, new_icon_id)
                } else {
                    // alert("icon not changed")
                }
            } else if (new_icon_id) {
                // alert("icon set first time")
                create_relation("Relation", doc._id, new_icon_id)
            } else {
                // alert("icon remains undefined")
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
        var icons = get_icons(get_topics_by_type("Icon"))
        // fill dialog with icons
        $("#icon_dialog").empty()
        for (var i = 0, icon; icon = icons[i]; i++) {
            var a = $("<a>").attr({href: "", title: icon.label}).click(icon_selected(icon, this))
            $("#icon_dialog").append(a.append(render_icon(icon)))
        }
        // open dialog
        $("#icon_dialog").dialog("open")
        //
        return false
    }

    function icon_selected(icon, target) {
        return function() {
            // alert("selected icon=" + JSON.stringify(icon))
            $("#icon_dialog").dialog("close")
            $(target).empty().append(render_icon(icon))
            return false
        }
    }

    //

    function render_topics_icon(rel_topics) {
        if (!rel_topics.length) {
            return "<i>no icon</i>"
        }
        return render_icon(get_icon(rel_topics[0].id))
    }

    /**
     * @param   icon    an Icon object
     */
    function render_icon(icon) {
        return $("<img>").attr({id: icon.id, src: db.uri + icon.id + "/" + icon.src}).addClass("type-icon")
    }

    //

    function get_icon(icon_id) {
        var row = db.view("deepamehta3/dm3-icons", {key: icon_id}).rows[0]
        return new Icon(row)
    }

    function get_icons(icon_topics) {
        var rows = db.view("deepamehta3/dm3-icons", null, id_list(icon_topics)).rows
        var icons = []
        for (var i = 0, row; row = rows[i]; i++) {
            icons.push(new Icon(row))
        }
        return icons
    }

    //

    function Icon(row) {
        this.id = row.id
        this.label = row.value.label
        this.src = row.value.src
    }
}

/**
 * @return  ID of "Icon" topic, or undefined.
 */
dm3_iconpicker.by_attachment = function(icon_src) {
    var rows = db.view("deepamehta3/dm3-icons_by-attachment", {key: icon_src}).rows
    if (rows.length) {
        return rows[0].id
    }
}
