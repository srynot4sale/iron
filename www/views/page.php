<p><?= htmlentities($page['text']) ?></p>

<h2>Linked to</h2>

<?php
    foreach ($linkedto as $relationship) {
?>
<p>
    <a href="/<?= $relationship['data.uid'] ?>">#</a>
    <?= $relationship['data.text'] ?>
    [<a href="/view.php?uid=<?= $page['uid'] ?>&del=<?= $relationship['data.uid'] ?>">X</a>]
</p>
<?php
    }
?>

<h2>Add relationship</h2>

<form method="POST">

<p>
    Type:
    <select name="type">
        <option value="1">Related</option>
    </select>
</p>

<p>
    UID:
    <input type="text" name="related" />
</p>

<p>
    <input type="submit" value="Add relationship" /></p>
</p>

</form>
