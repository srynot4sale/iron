<table>
<tbody>
<?php

    foreach ($pages as $page)
    {
?>
    <tr>
        <td>
        <a href="/<?= $page['id'] ?>">#</a> <?= $page['text'] ?> <?= str_repeat('.', $page['links']) ?>
        </td>
    </tr>

<?php
    }
?>
</tbody>
</table>
